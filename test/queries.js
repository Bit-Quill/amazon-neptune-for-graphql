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
        query: 'query MyQuery {\n' +
            '  getNodeAirport(filter: {code: {eq: "YKM"}}) {\n' +
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
        variables: {},
        validation(response) {
            const airport = response.data.getNodeAirport;
            expect(airport.continentContainsIn.desc).toEqual('North America');
            expect(airport.countryContainsIn.desc).toEqual('United States');
            expect(airport.airportRoutesOut.length).toEqual(1);
            expect(airport.airportRoutesOut[0].code).toEqual('SEA');
        }
    }
]