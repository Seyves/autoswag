/**
 * I am a description of that confusing request
 * @request GET /protection/numbers/{campaignId}
 * @security OpenIdSchema users:read
 * @security OpenIdSchema users:write
 * @operationId getNumbers
 * @deprecated
 * @server http://someserver.com/api/v1 Production server
 * @summary Get protection numbers
 * @tag Numbers
 * @pathParam {string} campaignId Campaign id
 * @queryParam {string} [verbose] Is verbose
 * @headerParam {string} [Accept] What type to accept
 * @cookieParam {string} [Accept] What type to accept
 * @body Asdfsdfdsf
 * @bodyContent {Number} [] application/json
 * @response 200 Ok
 * @responseContent {Numbers}
 * @response 400 Bad Request
 * @response 404 Campaign not found
 * @responseContent {Numbers} application/json
 */

/**
 * I am a description of that confusing request
 * @autodoc GET /protection/numbers/{campaignId}
 * @pathParam   {string}  campaignId           Campaign id
 * @queryParam  {string}  [verbose]            Is verbose
 * @headerParam {string}  [Accept]             What type to accept
 * @cookieParam {string}  [myCookie]           Your cookie
 * @request               required             Request content
 * @accept      {Query}   application/json
 * @accept      {string}  text/csv
 * @response    {Numbers} application/json     My okay response
 * @response              400.application/json Bad Request
 * @response              404                  Campaign not found
 */

/**
 * I am a description of that confusing request
 * @autodoc GET /protection/numbers/{campaignId}
 * @pathParam   {string}  campaignId           Campaign id
 * @queryParam  {string}  [verbose]            Is verbose
 * @headerParam {string}  [Accept]             What type to accept
 * @cookieParam {string}  [myCookie]           Your cookie
 * @request               required             Request content
 * @accept      {Query}   application/json
 * @accept      {string}  text/csv
 * @response    {ref:Numbers} application/json     My okay response
 * @response              400.application/json Bad Request
 * @response              404                  Campaign not found
 */
