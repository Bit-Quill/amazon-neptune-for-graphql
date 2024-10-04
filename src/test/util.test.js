import {parseNeptuneDomain} from '../util.js';

test('parse domain from neptune cluster host', () => {
    expect(parseNeptuneDomain('db-neptune-abc-def.cluster-xyz.us-west-2.neptune.amazonaws.com')).toBe('neptune.amazonaws.com');
});

test('parse domain from neptune analytics host', () => {
    expect(parseNeptuneDomain('g-abcdef.us-west-2.neptune-graph.amazonaws.com')).toBe('neptune-graph.amazonaws.com');
});

test('parse host without enough parts throws error', () => {
    expect(() => parseNeptuneDomain('invalid.com')).toThrow('Cannot parse domain from invalid.com');
});