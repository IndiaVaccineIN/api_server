/*
*  //GET call to search
*  endpoint: url/api/v1/search/:area
*  area = "partial zipcode or partial district name"
*
*  //top 5 suggestions based on input
*  response: [ area1, area2, area3, area4, area5]
* */


/*
*   //POST call to get all the CVC
*   endpoint: url/api/v1/getCVC
*
*   payload: {
*       area: "zipcode or district name",
*       //for pagination
*       page: 1,
*       page_size: 25
*
*       //future scope
*       sort: { // optional
*           distance: 1, // order in which to sort
*           // availability: 1
*       },
*       filter: { // optional
*           vaccines: ["Covaxin"],
*           radius: 10 // distance in KM or miles
*           status: ["verified"] // statuses of the cvc center
*       },
*   }
*
*   //top 25 result based on sort, filters and page_size
*   response:[
*       {
*           name: "cvc name",
*           district: "district to which cvc belong"
*           state: "state to which cvc belongs"
*
*           //future scope
*           pincode: "cvc pincode",
*           geo: {
*               latitude:"latitude location",
*               longitude: "longitude location"
*           },
*           available: 120 // count of available vaccines,
*           status: "verified" // status of the cvc,
*           availability:[
*               {
*                   day: "2021-05-03",
*                   count: 130 // number of slots available for 3rd may
*               }
*           ]
*       }
* ]
* */