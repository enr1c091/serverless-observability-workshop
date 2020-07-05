+++
title = "Testing the APIs"
weight = 57
+++

Go back to your Cloud9 environment and open a terminal tab.

### Development Environment Testing

#### Export the Dev stack output variables

To invoke our API's, we first need to fetch the `ApiUrl` output variable that our CloudFormation Development stack gives us. So let us iterate through our stack and export all output variables as environment variables.

```sh
    stack_info=$(aws cloudformation describe-stacks --stack-name demo-service-Dev --output json)
    if [[ "$stack_info" =~ "OutputKey" ]]; then
      read -r -a output_keys <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputKey")
      read -r -a output_vals <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputValue")
      for ((i=0;i<${#output_keys[@]};++i)); do
        key=$(echo "${output_keys[i]}" | sed -e 's/^"//'  -e 's/"$//')
        val=$(echo "${output_vals[i]}" | sed -e 's/^"//'  -e 's/"$//')
        echo "export $key=$val"
        export "$key"="$val"
      done
    fi
```

#### Test the `Put Item` operation

```sh
curl -X POST \
  $ApiUrl/items/ \
  -d '{
        "id":"1",  
        "name": "Development Test Item"
  }'
```

#### Test the `Get Item by Id` operation

```sh
curl -X GET $ApiUrl/items/1
```

Your expected output should be:

```json
{"id":"1","name":"Development Test Item"}
```

### Production Environment Testing

#### Export the Prod stack output variables

Let's override our environment variables with the values from the Production stack.

```sh
    stack_info=$(aws cloudformation describe-stacks --stack-name demo-service-Prod --output json)
    if [[ "$stack_info" =~ "OutputKey" ]]; then
      read -r -a output_keys <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputKey")
      read -r -a output_vals <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputValue")
      for ((i=0;i<${#output_keys[@]};++i)); do
        key=$(echo "${output_keys[i]}" | sed -e 's/^"//'  -e 's/"$//')
        val=$(echo "${output_vals[i]}" | sed -e 's/^"//'  -e 's/"$//')
        echo "export $key=$val"
        export "$key"="$val"
      done
    fi
```

#### Test the `Get Item by Id` operation

Let's first make sure that we are calling a different endpoint return different data.

```sh
curl -X GET $ApiUrl/items/1
```

Your expected output should be:

```json
{}
```

#### Test the `Put Item` operation

```sh
curl -X POST \
  $ApiUrl/items/ \
  -d '{
        "id":"1",  
        "name": "Production Test Item"
  }'
```

#### Test the `Get Item by Id` operation again

```sh
curl -X GET $ApiUrl/items/1
```

Your expected output should be:

```json
{"id":"1","name":"Production Test Item"}
```