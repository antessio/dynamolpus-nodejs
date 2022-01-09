import { expect,should } from "chai";
import { DynamoDB } from "aws-sdk"
import { DataModel, Repository } from "../app/dynamoplus/repository/dynamo";
import { getLocalClient } from "../app/dynamoplus/repository/client";


const localClient = getLocalClient()
const tableName = "test"
let repository = new Repository(tableName,localClient)
describe('Test DynamoDB repository', function(){
    let itemsInDB = []
    before(async ()=>{
        const result = await repository.createTable()
        expect(result.TableDescription.TableStatus,"expected table created").equal("ACTIVE")
        //init dataset
        for(let i=0; i<10; i++){
            
            const pk = "example#"+i;
            const sk = "example";
            const data = i+"";
            const document = { "id": i, "key": "test" };
            const itemToCreate = new DataModel(pk, sk, data, document);
            const putItemOutput = await repository.insert(itemToCreate)
            expect(putItemOutput,"item created").to.not.be.undefined
            expect(putItemOutput.$response.httpResponse.statusCode, "Expected 200").equal(200)
            itemsInDB.push(itemToCreate)
        }
    })

    after(async ()=>{
        const result = await repository.deleteTable()
        result.TableDescription.TableStatus 
        expect(result, "expected table deleted").not.undefined
    })
    // afterEach(async()=>{
    
    //     localClient.scan({
    //         TableName: tableName
    //     }).promise()
    //     .then(res=>{
    //         res.Items.forEach(async(i)=>{
                
    //             const deleteResult=await localClient.deleteItem({
    //                 TableName: tableName,
    //                 Key: {
    //                     pk: i.pk,
    //                     sk: i.sk
    //                 }})
    //                 .promise()
    //                 //console.log(deleteResult.$response.httpResponse.statusCode)
                
    //         })
    //     });
    // })
    
    
 

    it("get by pk and sk ", async ()=>{
        const pk = "example#1";
        const sk = "example";
        const expected = itemsInDB[1]
        const getItemOutput = await repository.getByPkAndSk(pk,sk)
        expect(getItemOutput, "item retrieved").to.not.be.undefined
        expect(getItemOutput, "expected item previously created").deep.equal(expected)
        
    })

    it("get by sk and data ", async ()=>{
        
        const queryResult = await repository.queryBySkAndDataEq("example","1",10)
        expect(queryResult, "result retrieved").to.not.be.undefined
        expect(queryResult.results, "results found").to.have.length(1,`but was ${queryResult.results.length}`)
        //expect(getItemOutput, "expected "+getItemOutput+" equal to "+itemToCreate).deep.equal(itemToCreate)
        
    })
})