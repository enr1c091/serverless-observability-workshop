const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))
const docClient = new AWS.DynamoDB.DocumentClient()
const { MetricUnit } = require('../lib/helper/models');
const { logger_setup, putMetric, logMetric } = require('../lib/logging/logger');
const log = logger_setup()

let _cold_start = true


exports.getAllItemsHandler = async (event, context) => {
    const subsegment = AWSXRay.getSegment().addNewSubsegment('Get All Items')
    let response
    try {
        if (_cold_start) {
            //Metrics
            await putMetric(name = 'ColdStart', unit = MetricUnit.Count, value = 1, { service: 'item_service', function_name: context.functionName })
            _cold_start = false
        }
        if (event.httpMethod !== 'GET') {
            log.error({ "operation": "get-all-items", "details": `getAllItems only accept GET method, you tried: ${event.httpMethod}` })
            logMetric(name = 'UnsupportedHTTPMethod', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'get-all-items' })
            throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
        }

        log.info(event);
        log.info(context);

        const items = await getAllItems(subsegment)
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(items)
        }
        //Metrics
        await putMetric(name = 'SuccessfullGetAllItems', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'get-all-items' });
        //Tracing
        log.debug('Adding All Items Retrieval annotation')
        subsegment.addAnnotation('ItemsCount', items.Count);
        subsegment.addAnnotation('Status', 'SUCCESS');
    } catch (err) {
        //Tracing
        log.debug('Adding All Items Retrieval annotation before raising error')
        subsegment.addAnnotation('Status', 'FAILED');
        //Logging
        log.error({ "operation": "get-all-items", "details": err })

        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(err)
        }

        //Metrics
        await putMetric(name = 'FailedGetAllItems', unit = MetricUnit.Count, value = 1, { service: 'item_service', operation: 'get-all-items' });
    } finally {
        subsegment.close()
    }
    log.info({operation: 'get-all-items', eventPath: event.path, statusCode: response.statusCode, body:response.body});
    return response;
}


const getAllItems = async (segment) => {
    let subsegment = segment.addNewSubsegment('getAllItemsData')
    let response
    try {
        var params = {
            TableName: process.env.SAMPLE_TABLE
        };
        response = await docClient.scan(params).promise();

        //Logging
        log.info({ "operation": "get-all-items", "details": response })
        log.debug('Adding getAllItemsData operation result as tracing metadata')
        //Tracing
        subsegment.addMetadata('items', response);
    } catch (err) {
        log.debug({ "operation": "get-all-items", "details": err })
        throw err;
    } finally {
        subsegment.close();
    }
    return response;
}