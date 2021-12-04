# @chandla/api-mock-server
OpenAPI mock server project (!!!UNDER CONSTRUCTION!!!)

## What's this
'api-mock-server' is a mock server for OpenAPI.
It has these features.
- Serving static contents  
'api-mock-server' is mede for testing of Single Page Applications as static web contents.  
It can make contents and APIs Same-Oigin.
- Support endpoint prefixes  
Sometime API's endpoints have prefix path for loadbalancing.  
Some mock servers supports only raw endpoints. But large scale systems have prefix path before endpoints that are defined by OpenAPI specifications.  
- Support conditional responses  
Some mock servers can reply only one response. But sometime we want to be replied vary responses in one API.(e.g. paging)
'api-mock-server' can reply vary responses conditionally by reauest headers, cookies, JSON in body, path parameters and query parameters.
The conditions are like a condition expression in javascript.(Actually these conditions are evaluated as javascript's condition expression.)
- Support any Content-Types  
Response data are places as simple files. 'api-mock-server' send raw data from files.  
You can set 'Content-Type' response header in a response metadata file. 