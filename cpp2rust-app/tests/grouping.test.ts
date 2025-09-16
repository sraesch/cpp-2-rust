import { expect, describe, it, assert } from 'vitest'
import { filterGroupedCMakeVariables, getVariablePrefix, groupCMakeVariablesByPrefix } from '../src/grouping'
import { CMakeVariable, CMakeVariableType } from '../src/backend/cmake'

describe('grouping-test', () => {
    it('prefix', () => {
        expect(getVariablePrefix('CMAKE_CXX_STANDARD')).to.equal('CMAKE')
        expect(getVariablePrefix('CMAKE_CXX_STANDARD_REQUIRED')).to.equal('CMAKE')
        expect(getVariablePrefix('CMAKE_CXX_EXTENSIONS')).to.equal('CMAKE')
        expect(getVariablePrefix('BUILD_SHARED_LIBS')).to.equal('BUILD')
        expect(getVariablePrefix('SOME_OTHER_VARIABLE')).to.equal('SOME')
        expect(getVariablePrefix('VARIABLE')).to.equal('VARIABLE')
        expect(getVariablePrefix('_LEADING_UNDERSCORE')).to.equal('')
        expect(getVariablePrefix('')).to.equal('')
    })

    it('cmake variable grouping', () => {
        const variables: CMakeVariable[] = [
            { name: 'CMAKE_CXX_STANDARD', value: '17', varType: CMakeVariableType.STRING, advanced: false },
            { name: 'CMAKE_CXX_STANDARD_REQUIRED', value: 'ON', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'CMAKE_CXX_EXTENSIONS', value: 'OFF', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'BUILD_SHARED_LIBS', value: 'ON', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'BUILD_TESTING', value: 'ON', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'SOME_OTHER_VARIABLE', value: 'value', varType: CMakeVariableType.STRING, advanced: true },
            { name: 'VARIABLE', value: 'value2', varType: CMakeVariableType.STRING, advanced: false },
            { name: '_LEADING_UNDERSCORE', value: 'value3', varType: CMakeVariableType.STRING, advanced: false },
        ]

        const result = groupCMakeVariablesByPrefix(variables)
        const groups = result.groups
        expect(Object.keys(groups).length).to.equal(2) // CMAKE, BUILD (SOME has only one entry, thus ignored)
        expect(groups['CMAKE'].length).to.equal(3)
        expect(groups['CMAKE'][0].name).to.equal('CMAKE_CXX_EXTENSIONS')
        expect(groups['CMAKE'][1].name).to.equal('CMAKE_CXX_STANDARD')
        expect(groups['CMAKE'][2].name).to.equal('CMAKE_CXX_STANDARD_REQUIRED')
        expect(groups['BUILD'].length).to.equal(2)
        expect(groups['BUILD'][0].name).to.equal('BUILD_SHARED_LIBS')
        expect(groups['BUILD'][1].name).to.equal('BUILD_TESTING')
        expect(result.ungrouped.length).to.equal(3) // VARIABLE, _LEADING_UNDERSCORE, SOME_OTHER_VARIABLE
        expect(result.ungrouped[0].name).to.equal('_LEADING_UNDERSCORE')
        expect(result.ungrouped[1].name).to.equal('SOME_OTHER_VARIABLE')
        expect(result.ungrouped[2].name).to.equal('VARIABLE')
    })

    it('cmake variable grouping with advanced filter', () => {
        const variables: CMakeVariable[] = [
            { name: 'CMAKE_CXX_STANDARD', value: '17', varType: CMakeVariableType.STRING, advanced: false },
            { name: 'CMAKE_CXX_STANDARD_REQUIRED', value: 'ON', varType: CMakeVariableType.BOOL, advanced: true },
            { name: 'CMAKE_CXX_EXTENSIONS', value: 'OFF', varType: CMakeVariableType.BOOL, advanced: true },
            { name: 'BUILD_SHARED_LIBS', value: 'ON', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'BUILD_CXX_TESTING', value: 'ON', varType: CMakeVariableType.BOOL, advanced: false },
            { name: 'SOME_OTHER_VARIABLE', value: 'value', varType: CMakeVariableType.STRING, advanced: true },
            { name: 'VARIABLE', value: 'value2', varType: CMakeVariableType.STRING, advanced: false },
            { name: '_LEADING_UNDERSCORE', value: 'value3', varType: CMakeVariableType.STRING, advanced: false },
        ]

        const groupedVariables = groupCMakeVariablesByPrefix(variables)
        const filteredGroupedVariables = filterGroupedCMakeVariables(groupedVariables, false, "CXX")
        const groups = filteredGroupedVariables.groups
        expect(Object.keys(groups).length).to.equal(2) // CMAKE, BUILD
        expect(groups['CMAKE'].length).to.equal(1) // CMAKE_CXX_STANDARD_REQUIRED and CMAKE_CXX_EXTENSIONS are advanced
        expect(groups['CMAKE'][0].name).to.equal('CMAKE_CXX_STANDARD')
        expect(groups['BUILD'].length).to.equal(1) // BUILD_CXX_TESTING matches search, BUILD_SHARED_LIBS does not
        expect(groups['BUILD'][0].name).to.equal('BUILD_CXX_TESTING')
        expect(filteredGroupedVariables.ungrouped.length).to.equal(0) // No ungrouped variables
    })
})
