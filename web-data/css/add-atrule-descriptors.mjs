import { listAll } from '@webref/css'

export async function addAtRuleDescriptors(atDirectives) {
    await addMediaQueryAtRuleDescriptors(atDirectives.find((directive) => directive.name === '@media'))
    return atDirectives
}

/**
 * @typedef {{name: string, href: string, value: string, type: string, values?: SpecDescriptorValue[]}} SpecDescriptor
 * @typedef {{name: string, prose: string, href: string, type: string, value: string}} SpecDescriptorValue
 * @typedef {{name: string, description?: string, references: IReference[], syntax: string, type: string, values: IValueData[]}} Descriptor
 * @typedef {{name: string, description?: string, references: IReference[]}} IValueData
 * @typedef {{name: string, url: string}} IReference
 */

async function addMediaQueryAtRuleDescriptors(atDirective) {
    const listall = await listAll();
    /** @type {SpecDescriptor[]} */
    const specDescriptors = listall.atrules.find((obj) => obj.name === '@media').descriptors
    /** @type {Descriptor[]} */
    const outDescriptors = []
    for (const descriptor of specDescriptors) {
        outDescriptors.push({
            name: descriptor.name,
            references: [{ name: 'W3C Reference', url: descriptor.href }],
            type: descriptor.type,
            syntax: descriptor.value,
            values: descriptor.values?.map((value) => ({
                name: value.name,
                description: value.prose,
                references: [{ name: 'W3C Reference', url: value.href }],
            })),
        })
    }
    atDirective.descriptors = outDescriptors
}
