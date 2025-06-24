/**
 * TODO merge query files in TestCases/Case01/queries into this file so that there is a single source for test queries
 */
export const QUERIES = [
    {
        description: 'get continents',
        query: 'query {getNodeContinents {code}}',
        variables: {},
        validation: (response) => {
            const codes = response.data.getNodeContinents.map(continent => continent.code).sort();
            expect(codes).toEqual(['AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA']);
        }
    },
    {
        description: 'get airport filtered by city',
        query: 'query MyQuery {\n' +
            '  getNodeAirport(filter: {city: {eq: "Seattle"}}) {\n' +
            '    country\n' +
            '    code\n' +
            '  }\n' +
            '}',
        variables: {},
        validation(response) {
            const airport = response.data.getNodeAirport;
            expect(airport.country).toEqual('US');
            expect(airport.code).toEqual('SEA');
        }
    },
    {
        description: 'get airport with relationships using nested queries',
        query: 'query MyQuery($code:String) {\n' +
            '  getNodeAirport(filter: {code: {eq: $code}}) {\n' +
            '    continentContainsIn{\n' +
            '      desc\n' +
            '    },\n' +
            '    countryContainsIn {\n' +
            '      desc\n' +
            '    },\n' +
            '    airportRoutesOut {\n' +
            '      code\n' +
            '    }\n' +
            '  }\n' +
            '}',
        variables: {
            "code": "YKM"
        },
        validation(response) {
            const airport = response.data.getNodeAirport;
            expect(airport.continentContainsIn.desc).toEqual('North America');
            expect(airport.countryContainsIn.desc).toEqual('United States');
            expect(airport.airportRoutesOut.length).toEqual(1);
            expect(airport.airportRoutesOut[0].code).toEqual('SEA');
        }
    }, {
        description: 'get airports with offset paging - first page',
        query: 'query MyQuery($country: String, $off:Int, $lim: Int) {\n' +
            '  getNodeAirports(\n' +
            '    filter: {country: {eq: $country}}\n' +
            '    options: {offset: $off, limit: $lim}\n' +
            '    sort: {code: ASC}\n' +
            '  ) {\n' +
            '    code\n' +
            '  }\n' +
            '}',
        variables: {
            "country":"CA",
            "off": 0,
            "lim":5
        },
        validation(response) {
            const airports = response.data.getNodeAirports;
            expect(airports.length).toEqual(5);
            expect(airports.map(ap => ap.code)).toEqual(['AKV', 'KEW', 'KIF', 'MSA', 'QBC']);
        }
    },
    {
        description: 'get airports with offset paging - second page',
        query: 'query MyQuery($country: String, $off:Int, $lim: Int) {\n' +
            '  getNodeAirports(\n' +
            '    filter: {country: {eq: $country}}\n' +
            '    options: {offset: $off, limit: $lim}\n' +
            '    sort: {code: ASC}\n' +
            '  ) {\n' +
            '    code\n' +
            '  }\n' +
            '}',
        variables: {
            "country":"CA",
            "off": 5,
            "lim":5
        },
        validation(response) {
            const airports = response.data.getNodeAirports;
            expect(airports.length).toEqual(5);
            expect(airports.map(ap => ap.code)).toEqual(['XBE', 'XGR', 'XKS', 'YAA', 'YAB']);
        }
    },
    {
        description: 'get airports filter, sort, limit',
        query: 'query MyQuery($code: String, $lim: Int) {\n' +
            '  getNodeAirports(\n' +
            '    filter: {code: {startsWith: $code}, runways: 3}\n' +
            '    options: {limit: $lim}\n' +
            '    sort: {code: DESC}\n' +
            '  ) {\n' +
            '    code\n' +
            '  }\n' +
            '}',
        variables: {
            "code": "Y",
            "lim": 5
        },
        validation(response) {
            const airports = response.data.getNodeAirports;
            expect(airports.length).toEqual(5);
            expect(airports.map(ap => ap.code)).toEqual(['YZV', 'YZT', 'YYT', 'YYJ', 'YYE']);
        }
    },
    {
        description: 'get airport with nested filter, sort, limit and nested selection set',
        query: 'query MyQuery($code:String, $lim:Int, $country:String) {\n' +
            '  getNodeAirport(filter: {code: {eq: $code}}) {\n' +
            '    city\n' +
            '    airportRoutesOut(filter: {country: {eq: $country}}, options: {limit: $lim}, sort: [{code: DESC}]) {\n' +
            '      code\n' +
            '      route {\n' +
            '        dist\n' +
            '      }\n' +
            '    }\n' +
            '  }\n' +
            '}',
        variables: {
            "code": "YVR",
            "lim": 2,
            "country": "CA"
        },
        validation(response) {
            const airport = response.data.getNodeAirport;
            expect(airport.city).toEqual('Vancouver');
            expect(airport.airportRoutesOut.length).toEqual(2);
            // outbound codes should be sorted in descending order
            expect(airport.airportRoutesOut[0].code).toEqual('ZMT');
            expect(airport.airportRoutesOut[0].route.dist).toEqual(508);
            expect(airport.airportRoutesOut[1].code).toEqual('YZZ');
            expect(airport.airportRoutesOut[1].route.dist).toEqual(252);
        }
    }
]