const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))
const cloudwatch = new AWS.CloudWatch()
const log = require('lambda-log');
const MetricUnit = require('../helper/models');

exports.logger_setup = () => {
    log.options.debug = process.env.ENABLE_DEBUG
    log.options.dynamicMeta = function (message) {
        return {
            timestamp: new Date().toISOString()
        };
    };
    return log
}

exports.putMetric = async (name, unit = MetricUnit.Count, value = 0, options) => {
    // Creating Custom Metrics synchronously would impact on performance/execution time
    try {
        log.debug(`Creating custom metric ${name}`)
        const metric = buildMetricData(name, unit, value, options)
        log.info(metric)
        await cloudwatch.putMetricData(metric).promise()
    } catch (err) {
        log.error({ operation: options.operation !== undefined ? options.operation : 'undefined_operation', method: 'putMetric', details: err })
        throw err
    }
}

exports.logMetric = (name, unit = MetricUnit.Count, value = 0, options) => {
    // Creating Custom Metrics synchronously would impact on performance/execution time
    // Logging a metric to CloudWatch Logs allows us to pick them up asynchronously
    // and create them as a metric in an external process
    // leaving the actual business function compute time to its logic only
    try {
        log.debug(`Logging custom metric ${name} for async processing`)
        const metric = buildMetricData(name, unit, value, options)
        log.info(metric)
    } catch (err) {
        log.error({ operation: options.operation !== undefined ? options.operation : 'undefined_operation', method: 'logMetric', details: err })
        throw err
    }
}

const buildMetricData = (name, unit, value, options) => {
    let namespace = 'MonitoringApp', service = 'service_undefined'

    if (options) {
        if (options.namespace !== undefined) namespace = options.namespace
        if (options.service !== undefined) service = options.service
        delete options.namespace
        delete options.service
    }

    const metric = {
        MetricData: [
            {
                MetricName: name,
                Dimensions: buildDimensions(service, options),
                Timestamp: new Date(),
                Unit: unit,
                Value: value
            },
        ],
        Namespace: namespace
    };
    return metric
}

const buildDimensions = (service, extra_dimensions) => {
    // CloudWatch accepts a max of 10 dimensions per metric
    // We include service name as a dimension
    // so we take up to 9 values as additional dimensions
    // before we return our dimensions array
    let dimensions = [{ Name: 'service', Value: service }]
    if (extra_dimensions) {
        Object.keys(extra_dimensions).forEach(k => {
            dimensions.push({ Name: k, Value: extra_dimensions[k] })
        });
        dimensions = dimensions.slice(0, 10)
    }
    return dimensions
}
