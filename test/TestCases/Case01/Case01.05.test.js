
import { jest } from '@jest/globals';
import { loadResolver } from '../../testLib';

describe('AppSync resolver', () => {
    let resolverModule;

    beforeAll(async () => {
        resolverModule = await loadResolver('./TestCases/Case01/output/output.resolver.graphql.js');
    });

    test('should resolve queries with a filter', () => {
        const result = resolve({
            field: 'getNodeAirport',
            arguments: { filter: { code: 'SEA' } },
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirport_Airport:`airport`{code: $getNodeAirport_Airport_code})\n' +
                'RETURN {city: getNodeAirport_Airport.`city`} LIMIT 1',
            parameters: { getNodeAirport_Airport_code: 'SEA' },
            language: 'opencypher',
            refactorOutput: null
        });
    });

    test('should resolve queries with an empty filter object', () => {
        const result = resolve({
            field: 'getNodeAirport',
            arguments: { filter: {} },
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirport_Airport:`airport`)\n' +
                'RETURN {city: getNodeAirport_Airport.`city`} LIMIT 1',
            parameters: {},
            language: 'opencypher',
            refactorOutput: null
        });
    });

    test('should resolve queries without a filter', () => {
        const result = resolve({
            field: 'getNodeAirport',
            arguments: {},
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirport_Airport:`airport`)\n' +
                'RETURN {city: getNodeAirport_Airport.`city`} LIMIT 1',
            parameters: {},
            language: 'opencypher',
            refactorOutput: null
        });
    });

    test('should resolve queries with a filter that contains numeric and string values', () => {
        const result = resolve({
            field: 'getNodeAirports',
            arguments: { filter: { country: 'US', runways: 3 } },
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirports_Airport:`airport`{country: $getNodeAirports_Airport_country, runways: $getNodeAirports_Airport_runways})\n' +
                'RETURN collect({city: getNodeAirports_Airport.`city`})',
            parameters: { getNodeAirports_Airport_country: 'US',  getNodeAirports_Airport_runways: 3},
            language: 'opencypher',
            refactorOutput: null
        });
    });

    test('should resolve queries with a string id filter', () => {
        const result = resolve({
            field: 'getNodeAirport',
            arguments: { filter: { _id: '22' } },
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirport_Airport:`airport`) WHERE ID(getNodeAirport_Airport) = $getNodeAirport_Airport_whereId\n' +
                'RETURN {city: getNodeAirport_Airport.`city`} LIMIT 1',
            parameters: { getNodeAirport_Airport_whereId: '22'},
            language: 'opencypher',
            refactorOutput: null
        });
    });

    test('should resolve queries with an integer id filter', () => {
        const result = resolve({
            field: 'getNodeAirport',
            arguments: { filter: { _id: 22 } },
            selectionSetGraphQL: '{ city }'
        });

        expect(result).toEqual({
            query: 'MATCH (getNodeAirport_Airport:`airport`) WHERE ID(getNodeAirport_Airport) = $getNodeAirport_Airport_whereId\n' +
                'RETURN {city: getNodeAirport_Airport.`city`} LIMIT 1',
            parameters: { getNodeAirport_Airport_whereId: '22'},
            language: 'opencypher',
            refactorOutput: null
        });
    });

    function resolve(event) {
        return resolverModule.resolveGraphDBQueryFromAppSyncEvent(event);
    }
});
