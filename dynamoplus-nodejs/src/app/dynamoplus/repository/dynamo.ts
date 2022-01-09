import "dotenv/config";
import { DynamoDB } from "aws-sdk"

import { getClient,getLocalClient } from "./client"
import { CreateTableOutput, DeleteTableOutput } from "aws-sdk/clients/dynamodb";


export class DataModel {
    pk: string
    sk: string
    data: string
    document:any
  constructor(
    pk: string, 
    sk: string, 
    data: string,
    document: any
) {
    this.pk = pk
    this.sk = sk
    this.data = data
    this.document = document
  }
  
  
    
    static fromItem(item?: DynamoDB.AttributeMap): DataModel {
        if (!item) throw new Error("No item!")
        return new DataModel(item.pk.S, item.sk.S,item.data.S, DynamoDB.Converter.output(item.document))
    }

    toPrimaryKey(): DynamoDB.Key {
        return {
            pk: { S: this.pk },
            sk: { S: this.sk }
        }
    }
    toGSIPrimaryKey(): DynamoDB.Key {
        return {
            sk: { S: this.sk },
            data: {S: this.data}
        }
    }
    toKeys(): DynamoDB.Key {
        return {
            pk: { S: this.pk },
            sk: { S: this.sk },
            data: {S: this.data}
        }
    }
    toItem(): Record<string, unknown> {
        return {
            pk: { S: this.pk},
            sk: { S: this.sk },
            data: { S: this.data},
            document: DynamoDB.Converter.input(this.document)
        }
    }

}

export class QueryResult{
    results: Array<DataModel>
    lastEvaluatedKey?: DataModel

  constructor(results: Array<DataModel>, lastEvaluatedKey?: DataModel) {
    this.results = results
    this.lastEvaluatedKey = lastEvaluatedKey
  }

}


export class Repository{
    private tableName:string;
    private client:DynamoDB;
    private environment:string;
    
    constructor(tableName: string, client:DynamoDB) {
        this.tableName = tableName
        this.environment = process.env.ENVIRONMENT;
        this.client = client
    }
    insert(record: DataModel) {
        return this.client.putItem({Item: record.toItem(),TableName: this.tableName}).promise()
    }

    deleteTable = async():Promise<DeleteTableOutput>=>{
        //console.info(`deleting table ${this.tableName}`)
        return this.client.deleteTable({TableName: this.tableName}).promise()
    }
    createTable = async():Promise<CreateTableOutput>=>{

        let provisioning;
        let gsiProvisioning;
        if("local"==this.environment){
            provisioning = {
                ProvisionedThroughput: {
                    WriteCapacityUnits: 1,
                    ReadCapacityUnits: 1
                }
            }
            gsiProvisioning = {...provisioning}
        }else{
            provisioning = {
                BillingMode: "PAY_PER_REQUEST"
            }
        }
        const baseParamsGSI = {
            GlobalSecondaryIndexes: [
                {
                    IndexName: "sk-data-index",
                    KeySchema: [
                        { AttributeName: "sk", KeyType: "HASH" },
                        { AttributeName: "data", KeyType: "RANGE" }
                    ],
                    Projection: { ProjectionType: "ALL" },
                    ...gsiProvisioning
                }
            ]
        }
        const baseParam = {
            TableName: this.tableName,
            KeySchema: [
                { AttributeName: "pk", KeyType: "HASH" },
                { AttributeName: "sk", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: "pk", AttributeType: "S" },
                { AttributeName: "sk", AttributeType: "S" },
                { AttributeName: "data", AttributeType: "S" }
            ],
            ...baseParamsGSI,
            ...provisioning
        };
    
        return await this.client.createTable(baseParam).promise();
        

    }
    getByPkAndSk = async(pk:string, sk:string):Promise<DataModel> =>{
        
        try {
            const resp = await this.client
            .getItem({
                TableName: this.tableName,
                Key: {
                    pk: { S: pk },
                    sk: { S: sk }
                }
            })
            .promise();
            return DataModel.fromItem(resp.Item)
        } catch (error) {
            console.log(error)
            throw error
        }

    }

    executeQuery = async(queryInput:DynamoDB.QueryInput):Promise<QueryResult> =>{
        try {
            const resp = await this.client
            .query(queryInput)
            .promise();
            return new QueryResult(resp.Items.map(i => DataModel.fromItem(i)),
            resp.LastEvaluatedKey?new DataModel(resp.LastEvaluatedKey.pk.S,resp.LastEvaluatedKey.sk.S,resp.LastEvaluatedKey.data.S,null)
            :null)
            
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    queryBySkAndDataEq = async(sk:string,data:string, limit: number, startFrom?:DataModel):Promise<QueryResult> =>{
        
        return this.executeQuery(
            {
                TableName: this.tableName,
                IndexName: "sk-data-index",
                ScanIndexForward: false,
                KeyConditionExpression:"#sk = :sk and #data = :data",
                ExpressionAttributeNames:{
                    "#sk":"sk",
                    "#data": "data"
                },
                ExpressionAttributeValues:{
                    ":sk": {S: sk},
                    ":data": {S: data}
                },
                ExclusiveStartKey: startFrom?startFrom.toKeys():null,
                Limit: limit
            }
        )
    
    }

    queryBySk = async(sk:string,limit: number, startFrom?:DataModel):Promise<QueryResult> =>{
        
       return this.executeQuery({
        TableName: this.tableName,
        IndexName: "sk-data-index",
        ScanIndexForward: false,
        KeyConditionExpression:"#sk = :sk",
        ExpressionAttributeNames:{
            "#sk":"sk"
        },
        ExpressionAttributeValues:{
            ":sk": {S: sk}
        },
        ExclusiveStartKey: startFrom?startFrom.toKeys():null,
        Limit: limit
    })
    
    }
    queryByPk = async(pk:string,limit: number, startFrom?:DataModel):Promise<QueryResult> =>{
        
        return this.executeQuery({
            TableName: this.tableName,
            ScanIndexForward: false,
            KeyConditionExpression:"#pk = :pk",
            ExpressionAttributeNames:{
                "#pk":"pk"
            },
            ExpressionAttributeValues:{
                ":pk": {S: pk}
            },
            ExclusiveStartKey: startFrom?startFrom.toKeys():null,
            Limit: limit
        })
    
    }

    
}
/*
- get by pk and sk: (pk,sk)
    - get by sk and data: (sk,data)
    - get by sk and data begins with: (sk,data_prefix)
    - get by sk and data <=: (sk,data)
    - get by sk and data >=: (sk,data)
    - get by sk and data <: (sk,data)
    - get by sk and data >: (sk,data)
    - get by sk and data between: (sk,data_from,data_to)
*/

