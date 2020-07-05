+++
title = "Testing the APIs"
weight = 36
+++

#### Export the stack output variables

To invoke our API's, we first need to fetch the `ApiUrl` output variable that our CloudFormation stack gives us. So let us iterate through our stack and export all output variables as environment variables:

```sh
    stack_info=$(aws cloudformation describe-stacks --stack-name sam-app --output json)
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
        "name": "Sample test item"
  }'

curl -X POST \
  $ApiUrl/items/ \
  -d '{
        "id":"2",  
        "name": "Second test item"
  }'
```

#### Test the `Get All Items` operation

```sh
curl -X GET $ApiUrl/items/
```

#### Test the `Get Item by Id` operation

```sh
curl -X GET $ApiUrl/items/1
```
