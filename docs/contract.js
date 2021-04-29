/*
*   //POST call to get all the CVC
*   endpoint: url/api/v1/getCVC
*
*   payload: {
*       district: "district",
*       pincode: "pincode",
*       //for pagination
*       page_number: 1,
*       page_size: 25
*
*       //future scope
*       sort: { // optional
*           distance: 1, // order in which to sort
*           // vaccine_count: 1
*       },
*       filter: { // optional
*           vaccines: ["Covaxin"], // vaccines : null
*           radius: 10 // distance in KM or miles
*           status: ["active"] // statuses of the cvc center
*           availability: true //default true
*       },
*   }
*
*   //top 25 result based on sort, filters and page_size
*   response:{
*       results:[
*       {
*           name: "cvc name",
*           cvc_site_id: "cvc id",
*           center_type: "central govt", // "state govt", "private"
*           address: {
*               locality: "locality to which cvc belong",
*               district: "district to which cvc belong",
*               state: "state to which cvc belongs",
*               city: "city to which cvc belongs",
*               pincode: "cvc pincode"
*           },
*           last_verified_at: "YYYY-MM-DD-HH-MM",// default "null"
*           operation_timings:[
*               {
*                   shift:1
*                   start_time: "HH-MM",
*                   end_time: "HH-MM"
*               },
*           ]
*           //future scope
*
*           geo: {
*               latitude:"latitude location",
*               longitude: "longitude location"
*           },
*           vaccine_count: 150 // count of available vaccines,
*           status: "active" // "closed", "out of stock",
*           next_stock_refresh_on: "YYYY-MM-DD" // only when status is "out of stock" otherwise null
*           google_location: "url for google location",
*           vaccine_type:[
*               {
*                   name: "covaxin" // "covisheild",
*                   vaccine_count: 130,
*                   cost: int
*               }
*           ]
*       }
*       ],
*       total_cvc_count = 130, // number of CVC matching the criteria,
*       current_page_number: 1,
*       total_page_number: 20
*   }
* */
