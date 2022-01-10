import { assert, expect } from "chai";

import { DataModel, Repository } from "../../../../app/dynamoplus/repository/dynamo";
import { getLocalClient } from "../../../../app/dynamoplus/repository/client";
import * as dataset from './dataset.json'

process.env.AWS_ACCESS_KEY_ID=""
process.env.AWS_SECRET_ACCESS_KEY=""
process.env.AWS_DEFAULT_REGION=""

const localClient = getLocalClient()
const tableName = "test"
let repository = new Repository(tableName,localClient)
describe('Test DynamoDB repository', function(){
    let itemsInDB = []
    before(async()=>{
    
        const result = await repository.createTable()
        expect(result.TableDescription.TableStatus,"expected table created").equal("ACTIVE")
        for(let i=0; i<dataset.items.length; i++){
            const d = dataset.items[i]
            const itemToCreate = new DataModel(d.pk, d.sk, d.data, d.document);
            const putItemOutput = await repository.insert(itemToCreate)
            expect(putItemOutput,"item created").to.not.be.undefined
            expect(putItemOutput.$response.httpResponse.statusCode, "Expected 200").equal(200)
            itemsInDB.push(itemToCreate)
        }
        
        
    })

    // after(async ()=>{
    //     const result = await repository.deleteTable()
    //     result.TableDescription.TableStatus 
    //     expect(result, "expected table deleted").not.undefined
    // })
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
        expect(getItemOutput, "expected "+JSON.stringify(getItemOutput)+" equals to item previously created "+JSON.stringify(expected)).deep.equal(expected)
        
    })

    it("get by sk and data ", async ()=>{
        const expected = itemsInDB[1]
        const queryResult = await repository.queryBySkAndDataEq("example","1",10)
        expect(queryResult, "result retrieved").to.not.be.undefined
        expect(queryResult.results, "results found").to.have.length(1,`but was ${queryResult.results.length}`)
        expect(queryResult.results[0], "expected item ").deep.equal(expected)
      
    })

    it("get by sk", async()=>{

        const expected = itemsInDB.filter(d=>d.sk==="example")
        const queryResult = await repository.queryBySk("example",20)
        expect(queryResult, "result retrieved").to.not.be.undefined
        expect(queryResult.results, "results found").to.have.length(expected.length,`but was ${queryResult.results.length}`)
        assert.sameDeepMembers(queryResult.results,expected,"expected results equals")

    })
})