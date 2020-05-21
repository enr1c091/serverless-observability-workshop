# Serverless Obersability Workshop 

## TO-DO:

- [x] Write the Logger lib for Custom Logging and Metrics 
- [x] Implement extensible Metric method for reusability across multiple apps
- [x] Add Business and ColdStart CloudWatch Custom Cetrics
- [x] Add X-Ray Annotations and Metadata for method calls 
- [x] Demonstrate how to inject X-Ray Subsegments to orchestrate method calls 
- [x] Enable Debug toggle on SAM Template
- [x] Create X-Ray Group for querying failed events by annotations
- [ ] Add Metric to capture Cold Start duration to report Avg time on CW Dashboards
- [ ] Enable API Gateway Custom Access Logs
- [ ] Create CloudWatch Dashboard template for import/export
- [ ] Create Log Subscription to asyncronously create CW Metrics
- [ ] Create CDK project to provision ES (Advanced Module in workshop)
- [ ] Create Log Subscription to push logs to ES
- [ ] Create Kibana Visualization / Dashboards for import/export
- [ ] Create Decorators for Tracing methods using X-Ray in a Tracing Lib 
- [ ] Properly chain method calls inside X-Ray Subsegments  
- [ ] Transform the Tracing/Logging Lib into a Layer for extended reusability (Maybe not needed for the workshop)
