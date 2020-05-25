import * as cdk from '@aws-cdk/core'
import cloudwatch = require('@aws-cdk/aws-cloudwatch')
import { GraphWidget, SingleValueWidget, Metric, DimensionHash } from "@aws-cdk/aws-cloudwatch"

export class CloudwatchCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackName = this.node.tryGetContext('stack_name')
    const opDashboard = new cloudwatch.Dashboard(this, 'MonitoringApp-Operational-Dashboard', { dashboardName: 'MonitoringApp-Operational-Dashboard' })
    opDashboard.addWidgets(
      this.buildSingleValueWidget('Get All Items -- Operational Metrics', 'monitoring-getAllItemsFunction-1OFYBMQ0CWM1D'),
      this.buildSingleValueWidget('Get Item By ID -- Operational Metrics', 'monitoring-getByIdFunction-PJDC795HE5YP'),
      this.buildSingleValueWidget('Put Item -- Operational Metrics', 'monitoring-putItemFunction-U6EIYZDPS5B5'),
    );

    const bdDashboard = new cloudwatch.Dashboard(this, 'MonitoringApp-Business-Dashboard', { dashboardName: 'MonitoringApp-Business-Dashboard' })
    bdDashboard.addWidgets(
      this.buildGraphWidget('Business Metrics')
    );
  }

  // Example with Graph Widget
  buildGraphWidget(widgetName: string, functionName: string = ''): GraphWidget {
    return new GraphWidget({
      title: widgetName,
      left: [
        this.buildMetric('MonitoringApp', 'Sucessful Item Registrations', 'monitoring-putItemFunction-U6EIYZDPS5B5', 'SuccessfullPutItem', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-putItemFunction-U6EIYZDPS5B5', FunctionVersion: '$LATEST', service: 'item_service', operation: 'put-item' }),
        this.buildMetric('MonitoringApp', 'Failed Item Registrations', 'monitoring-putItemFunction-U6EIYZDPS5B5', 'FailedPutItem', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-putItemFunction-U6EIYZDPS5B5', FunctionVersion: '$LATEST', service: 'item_service', operation: 'put-item' }),
        this.buildMetric('MonitoringApp', 'Sucessful Items Retrievals', 'monitoring-getByIdFunction-PJDC795HE5YP', 'SuccessfullGetItem', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-getByIdFunction-PJDC795HE5YP', FunctionVersion: '$LATEST', service: 'item_service', operation: 'get-by-id' }),
        this.buildMetric('MonitoringApp', 'Failed Items Retrievals', 'monitoring-getByIdFunction-PJDC795HE5YP', 'FailedGetItem', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-getByIdFunction-PJDC795HE5YP', FunctionVersion: '$LATEST', service: 'item_service', operation: 'get-by-id' }),
        this.buildMetric('MonitoringApp', 'Sucessful Items Retrievals', 'monitoring-getAllItemsFunction-1OFYBMQ0CWM1D', 'SuccessfullGetAllItems', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-getAllItemsFunction-1OFYBMQ0CWM1D', FunctionVersion: '$LATEST', service: 'item_service', operation: 'get-all-items' }),
        this.buildMetric('MonitoringApp', 'Failed Items Retrievals', 'monitoring-getAllItemsFunction-1OFYBMQ0CWM1D', 'FailedGetAllItems', 'sum', cdk.Duration.hours(1), { FunctionName: 'monitoring-getAllItemsFunction-1OFYBMQ0CWM1D', FunctionVersion: '$LATEST', service: 'item_service', operation: 'get-all-items' })
      ]
    })
  }

  // Example with Number Widget
  buildSingleValueWidget(widgetName: string, functionName: string = ''): SingleValueWidget {
    return new SingleValueWidget({
      title: widgetName,
      metrics: [
        this.buildMetric('MonitoringApp', '# of GetItems ColdStarts', functionName, 'ColdStart', 'sum', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST', service: 'item_service', function_name: functionName }),
        this.buildMetric('AWS/Lambda', 'GetItems ColdStart Duration', functionName, 'InitDuration', 'avg', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST' }),
        this.buildMetric('AWS/Lambda', 'GetItems Billed Duration', functionName, 'BilledDuration', 'avg', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST' }),
        this.buildMetric('AWS/Lambda', 'GetItems Billed Duration', functionName, 'MemorySize', 'avg', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST' }),
        this.buildMetric('AWS/Lambda', 'GetItems Billed Duration', functionName, 'MemoryUsed', 'avg', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST' }),
        this.buildMetric('AWS/Lambda', 'GetItems Estimated Cost ($)', functionName, 'EstimatedCost', 'sum', cdk.Duration.hours(1), { FunctionName: functionName, FunctionVersion: '$LATEST' })
      ]
    })
  }

  buildMetric(namespace: string, label: string, functionName: string, metricName: string, statistic: string, period: cdk.Duration, dimensions: DimensionHash): Metric {
    return new Metric({
      namespace: namespace,
      metricName: metricName,
      period: period,
      dimensions: dimensions,
      label: label,
      statistic: statistic
    })
  }
}
