const _ = require("lodash");

const csvCatgory = {
  1: "CGHS Empanelled",
  2: "Private PMJAY",
  3: "Health Facilities All States",
};

function transform(cvcData) {
  let cvcs = [];
  console.log(cvcData.date);

  _.each(cvcData.states, (state) => {
    const _state = _.pick(state, ["id", "name"]);
    _.each(state.districts, (district) => {
      const _district = _.pick(district, ["id", "name"]);
      _.each(district.cvcs, (cvc) => {
        cvcs.push(mapToDB(cvc, _state, _district));
      });
    });
  });
  return cvcs;
}

// against https://github.com/IndiaVaccineIN/api_server/blob/main/docs/contract.js
function mapToDB(cvc, state, district) {
  let _cvc = {};
  _cvc.cvc_site_id = _.get(cvc, "session_site_id");
  _cvc.name = _.get(cvc, "session_site_name");

  let _address = {};
  _address.district = district.name;
  _address.district_id = district.id;
  _address.state = state.name;
  _address.state_id = state.id;

  if (_.has(cvc, "address")) {
    let address = cvc.address;
    _address.locality = _.get(address, "block");
    _address.street = _.get(address, "address");
    _address.city = _.get(address, "city");
    _address.pincode = _.get(address, "pincode");

    _cvc.geo = {
      latitude: _.get(address, "latitude"),
      longitude: _.get(address, "longitude"),
    };

    _cvc.google_location = `https://www.google.com/maps/search/?api=1&query=${_cvc.geo.latitude},${_cvc.geo.longitude}`;

    _cvc.payment_type = _.get(address, "type");
    _cvc.category_id = _.get(address, "categoryno");
    _cvc.category_name = _.get(address, "categoryname");
    _cvc.contact = _.get(address, "contact");
    _cvc.mobile = _.get(address, "mobile");
  }
  _cvc.center_type = "";
  _cvc.address = _address;
  return _cvc;
}

module.exports = {
  transform,
};
