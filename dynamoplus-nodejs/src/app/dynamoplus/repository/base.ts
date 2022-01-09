import { DynamoDB } from "aws-sdk"

export abstract class Item {
    abstract get pk(): string
    abstract get sk(): string

    public keys(): DynamoDB.Key {
        return {
            pk: { S: this.pk },
            sk: { S: this.sk }
        }
    }

    abstract toItem(): Record<string, unknown>
}

