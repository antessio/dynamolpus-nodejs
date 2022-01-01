# TODO


## Repository 


**system**

|pk|sk|data|
|---|---|---|
|collection#<collection.id>|collection|<collection.id>|
|collection#<collection.id>|collection.name|<collection.name>|
|index#<index.name>|index|<index.name>|
|index#<index.name>|index#collection.name|<collection.name>
|aggregation_configuration#<aggregation_configuration.name>|aggregation_configuration|<aggregation_configuration.name>
|aggregation_configuration#<aggregation_configuration.name>|aggregation_configuration#collection.name|<collection.name>
|aggregation#<aggregation.id>|aggregation|<aggregation.id>
|client_authorization#<client_authorization.id>|client_authorization|<client_authorization.id>
|client_authorization#<client_authorization.id>|aggregation#aggregation_configuration>|<client_authorization.id>


- SystemRepository
    - get by pk and sk
    - get by sk and data

- DomainRepository
    - get by pk and sk: (pk,sk)
    - get by sk and data: (sk,data)
    - get by sk and data begins with: (sk,data_prefix)
    - get by sk and data <=: (sk,data)
    - get by sk and data >=: (sk,data)
    - get by sk and data <: (sk,data)
    - get by sk and data >: (sk,data)
    - get by sk and data between: (sk,data_from,data_to)

- QueryService
    - queryAll: (collection,start_from,limit)
    - queryRange: (collection,from_value,to_value, prefix)
    - queryEqual: (collection,value)
    - queryBeginsWith: (query,prefix)
    - queryLt: (query,value)
    - queryGt: (query,value)
    - queryLte: (query,value)
    - queryGte: (query,value)

- SystemService:
    - get collection by name
    - get all collections
    - insert collection
    - delete collection
    - get index by name
    - get all indexes
    - get index by collection name
    - insert index
    - delete index
    - get client authorization by id
    - get all client authorizations
    - insert client authorization
    - update client authorization
    - delete client authorization
    - get aggregation configuration by name
    - insert aggregation configuration
    - delete aggregation configuration
    - get aggregation by name
    - get aggregation  by aggregation configuration name
    - insert aggregation
    - update aggregation 
    - delete aggregation

- DomainService
    - get document by id
    - get all documents
    - create document
    - update document
    - delete document
    - query document: (predicate, starting_after, limit)

- AggregationService

- DynamoStreamService

- AuthorizationService
    - getBearerAuthorization
    - getApiKeyAuthorization
    - getHttpSignatureAuthorization
    - getBasicAuthorization
    

- API:
    - /v1/
        - /collections
        - /indexes
        - /aggregation_configurations
        - /aggregations
        - /client_authorizations
        - /{collection}
            - POST
            - GET
            - PATCH
            - DELETE
            - /query
                - POST

    - /v1/system
        - /info
        - /documentation
        - /setup
        - /login


