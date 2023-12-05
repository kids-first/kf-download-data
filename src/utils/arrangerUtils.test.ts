/* eslint-disable no-unused-expressions */
import { findValueInField, generateColumnsForProperty } from './arrangerUtils';

const getMockData = () => ({
    study: {
        short_name: 'Kids First: Pediatric Brain Tumors - CBTTC',
    },
    race: 'White',
    kf_id: 'PT_00G007DM',
    family: {
        family_compositions: [
            {
                composition: 'proband-only',
            },
        ],
    },
    diagnoses: [
        {
            diagnosis_category: 'Cancer',
        },
        {
            diagnosis_category: 'Diabetes',
        },
    ],
    // an_object.an_array.another_array.a_prop
    an_object: {
        an_array: [
            {
                another_array: [
                    {
                        a_prop: 'value 1',
                    },
                    {
                        a_prop: 'value 2',
                    },
                ],
            },
            {
                another_array: [
                    {
                        a_prop: 'value 3',
                    },
                ],
            },
            {
                another_array: [
                    {
                        another_prop: 'X',
                    },
                ],
            },
        ],
    },
});

describe('findValueInField', () => {
    let mockData;

    beforeEach(() => {
        mockData = getMockData();
    });

    it('returns the value of a first level scalar property', () => {
        const foundValue = findValueInField(mockData, 'race');
        expect(foundValue).toEqual('White');
    });

    it('returns default value if the field does not exist', () => {
        const foundValue = findValueInField(mockData, 'potato', 'does not exist');
        expect(foundValue).toEqual('does not exist');
    });

    it('returns null if the field does not exist and no default value is provided', () => {
        const foundValue = findValueInField(mockData, 'potato');
        expect(foundValue).toBeNull;
    });

    it('returns the value of a second level scalar property', () => {
        const foundValue = findValueInField(mockData, 'study.short_name');
        expect(foundValue).toEqual('Kids First: Pediatric Brain Tumors - CBTTC');
    });

    it('returns default value if an object property along the path does not exist', () => {
        const foundValue = findValueInField(mockData, 'french.fries', 'ketchup');
        expect(foundValue).toEqual('ketchup');
    });

    it('returns an array of value there is an array along the path', () => {
        const foundValue = findValueInField(mockData, 'diagnoses.diagnosis_category');
        expect(foundValue).toEqual(['Cancer', 'Diabetes']);
    });

    it('exclude properties of an array along the path that does not exist', () => {
        const foundValue = findValueInField(mockData, 'family.family_compositions.whatever');
        expect(foundValue).toEqual([]);
    });

    it('returns the correct value', () => {
        const foundValue = findValueInField(mockData, 'an_object.an_array.another_array.a_prop');
        expect(foundValue).toEqual(['value 1', 'value 2', 'value 3']);
    });
});

describe('reduceAndMerge', () => {
    const getMockData = () => ({
        a: 1,
        b: [{ d: 2 }, { f: [{ e: 3 }, { g: 6 }], h: 7 }],
        c: 5,
    });

    let mockData;

    beforeEach(() => {
        mockData = getMockData();
    });

    it('returns one row per row for property `propName`', () => {
        const result = generateColumnsForProperty(mockData, 'b');
        expect(result.length).toEqual(2);
    });

    it('returns rows that have all properties of the parent object, but with only the corresponding item of child property', () => {
        const result = generateColumnsForProperty(mockData, 'b');
        expect(result).toEqual([
            { a: 1, b: { d: 2 }, c: 5 },
            { a: 1, b: { f: [{ e: 3 }, { g: 6 }], h: 7 }, c: 5 },
        ]);
    });

    it('returns the source object untouched if the property is not found', () => {
        const result = generateColumnsForProperty(mockData, 'potato');
        expect(result).toEqual([mockData]);
    });

    it('returns the source object untouched if the property is not an array', () => {
        const result = generateColumnsForProperty(mockData, 'a');
        expect(result).toEqual([mockData]);
    });

    it('on multiple levels, returns one row per row for property `propName`', () => {
        const result = generateColumnsForProperty(mockData, 'b.f');
        expect(result.length).toEqual(3);
    });

    it('can flatten on 2 levels deep', () => {
        const result = generateColumnsForProperty(mockData, 'b.f');
        expect(result).toEqual([
            { a: 1, b: { d: 2 }, c: 5 },
            { a: 1, b: { f: { e: 3 }, h: 7 }, c: 5 },
            { a: 1, b: { f: { g: 6 }, h: 7 }, c: 5 },
        ]);
    });

    it('can flatten on 3 levels deep', () => {
        const result = generateColumnsForProperty(
            {
                a: 1,
                b: [{ c: [{ d: 2 }, { d: 4 }, { d: null }] }],
                e: 4,
            },
            'b.c.d',
        );
        expect(result).toEqual([
            { a: 1, b: { c: { d: 2 } }, e: 4 },
            { a: 1, b: { c: { d: 4 } }, e: 4 },
            { a: 1, b: { c: { d: null } }, e: 4 },
        ]);
    });

    it('can flatten on 4 levels deep', () => {
        const result = generateColumnsForProperty(
            {
                a: 1,
                b: [{ c: [{ d: [{ f: 1 }, { f: 2 }, { f: null }] }] }],
                e: 4,
            },
            'b.c.d.f',
        );
        expect(result).toEqual([
            { a: 1, b: { c: { d: { f: 1 } } }, e: 4 },
            { a: 1, b: { c: { d: { f: 2 } } }, e: 4 },
            { a: 1, b: { c: { d: { f: null } } }, e: 4 },
        ]);
    });

    it('can flatten an array having objects as ancestors at 3 levels deep ', () => {
        const result = generateColumnsForProperty(
            {
                a: 1,
                b: {
                    c: {
                        d: [
                            { k: 1, r: 1 },
                            { k: 2, r: 2 },
                        ],
                    },
                },
                e: 4,
            },
            'b.c.d',
        );
        expect(result).toEqual([
            { a: 1, b: { c: { d: { k: 1, r: 1 } } }, e: 4 },
            { a: 1, b: { c: { d: { k: 2, r: 2 } } }, e: 4 },
        ]);
    });

    it('can flatten an array of objects with the targeted property at 3 levels deep having as direct ancestor an object', () => {
        const result = generateColumnsForProperty(
            {
                a: 1,
                b: { c: [{ d: 1 }, { d: 2 }] },
                e: 4,
            },
            'b.c.d',
        );
        expect(result).toEqual([
            { a: 1, b: { c: { d: 1 } }, e: 4 },
            { a: 1, b: { c: { d: 2 } }, e: 4 },
        ]);
    });

    it('can flatten on multiple levels, only spreading targeted arrays', () => {
        const result = generateColumnsForProperty(
            {
                a: [
                    {
                        b: [
                            {
                                c: [
                                    {
                                        d: [{ e: 1 }],
                                    },
                                    {
                                        d: [{ e: 2 }],
                                    },
                                ],
                            },
                            {
                                e: [{ d: { e: 4 } }],
                            },
                        ],
                        bb: 'blah',
                    },
                ],
            },
            'a.b.c.d',
        );
        expect(result).toEqual([
            { a: { bb: 'blah', b: { c: { d: { e: 1 } } } } },
            { a: { bb: 'blah', b: { c: { d: { e: 2 } } } } },
            { a: { bb: 'blah', b: { e: [{ d: { e: 4 } }] } } }, // <- e is not spread here
        ]);
    });
});
