const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))
const docClient = new AWS.DynamoDB.DocumentClient()
const { MetricUnit } = require('../lib/helper/models')
const { logger_setup, putMetric, logMetric } = require('../lib/logging/logger')
const log = logger_setup()

let _cold_start = true

exports.putItemHandler = async (event, context) => {
    const subsegment = AWSXRay.getSegment().addNewSubsegment('Put Item')
    let response, id
    try {
        if (_cold_start) {
            //Metrics
            await putMetric(name = 'ColdStart', unit = MetricUnit.Count, value = 1, { service: 'item_service', function_name: context.functionName })
            _cold_start = false
        }
        if (event.httpMethod !== 'POST') {
            log.error({ "operation": "put-item", "details": `PutItem only accept GET method, you tried: ${event.httpMethod}` })
            logMetric(name = 'UnsupportedHTTPMethod', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'put-item' })
            throw new Error(`PutItem only accept POST method, you tried: ${event.httpMethod}`)
        }

        const item = await putItem(event, subsegment)

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(item)
        }
        //Metrics
        await putMetric(name = 'SuccessfullPutItem', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'put-item' })
        //Tracing
        log.debug('Adding Item Creation annotation')
        subsegment.addAnnotation('ItemID', JSON.parse(event.body).id)
        subsegment.addAnnotation('Status', 'SUCCESS')
    } catch (err) {
        //Tracing
        log.debug('Adding Item Creation annotation before raising error')
        subsegment.addAnnotation('ItemID', JSON.parse(event.body).id)
        subsegment.addAnnotation('Status', 'FAILED')
        //Logging
        log.error({ "operation": "put-item", "details": err })

        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(err)
        }

        //Metrics
        await putMetric(name = 'FailedPutItem', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'put-item' })
    } finally {
        subsegment.close()
    }
    log.info({ operation: 'put-item', eventPath: event.path, statusCode: response.statusCode, body: response.body })
    return response
}

const putItem = async (event, segment) => {
    let subsegment = segment.addNewSubsegment('putItemData')

    let response
    try {
        const body = JSON.parse(event.body)
        const id = body.id
        const name = body.name

        var params = {
            TableName: process.env.SAMPLE_TABLE,
            Item: { id: id, name: name }
        }

        response = await docClient.put(params).promise()

        //Logging
        log.info({ "operation": "put-item", "details": response })
        log.debug('Adding putItem operation result as tracing metadata')
        //Tracing
        subsegment.addMetadata('Item', response)
    } catch (err) {
        log.debug({ "operation": "put-item", "details": err })
        throw err
    } finally {
        subsegment.close()
    }
    return response
}