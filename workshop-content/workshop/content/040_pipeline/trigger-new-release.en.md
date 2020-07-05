+++
title = "Trigger New Release"
weight = 48
+++

#### Update Our Application
So far we have walked through setting up a multi-environment CI/CD for our serverless application using AWS CodePipeline and now we are going to make a change to the AWS CodeCommit repository so that we can see a new release built and delivered.

Open your **Cloud9** environment and go to your **serverless-repo** directory.

![Update Code](/images/update-code-1.png?width=15pc&classes=shadow)

Navigate to **/src/items/get-all-items/index.js** file. Change the the code in this line:

```javascript
    const response = {
      statusCode: 200,
      body: JSON.stringify(items)
    }
```

for this code:

```javascript
    const response = {
      statusCode: 200,
      body: `This new service now has these items: ${JSON.stringify(items)}`
    }
```

Since we're checking Unit Tests in our pipeline, we have to alter the test itself too. Navigate to **/\__tests\__/unit/items/get-all-items.test.js** file. Change the the code in this line:

```javascript
    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify(items)
    }
```

for this code:

```javascript
    const expectedResult = {
      statusCode: 200,
      body: `This new service now has these items: ${JSON.stringify(items)}`
    }
```

Change the text where it says “Hello World”, add a commit message and then click the “Commit changes” button.

```sh
cd ~/environment/serverless-repo
git add .
git commit -m "Change the message text"
git push
```

After you modify and commit your change in AWS CodeCommit, in approximately 30 seconds you will see a new build triggered in the AWS CodePipeline pipeline.

![Update Code](/images/update-code-2.png?width=40pc&classes=shadow)

{{% notice info %}}
It might take around 8-9 minutes for the whole pipeline to complete.
{{% /notice %}}

#### Confirm the Change

Let's test our Development API. 

```sh
stack_info=$(aws cloudformation describe-stacks --stack-name serverless-service-Dev --output json)
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

curl -X GET $ApiUrl/items/
```

```sh
This new service now has these items: []
```
