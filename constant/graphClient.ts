import { GraphQLClient } from 'graphql-request'

const v3SubgraphClient = new GraphQLClient('https://graph-node.monchain.info/subgraphs/name/v3', {
  headers: {
    'Content-Type': 'application/json'
  }
})

export default v3SubgraphClient
