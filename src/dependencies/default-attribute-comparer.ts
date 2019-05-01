import { DexxAttributeComparer, DexxAttributeMap } from '../dexx-types';

export class DefaultAttributeComparer implements DexxAttributeComparer {
  public compareAttributes(requestedAttributes: DexxAttributeMap,
                    storedAttributes: DexxAttributeMap,
                    exact = false): boolean {
    const cursorItemAttributeCount = Object.keys(storedAttributes).length;
    const attributeCount = Object.keys(requestedAttributes).length;
    if (exact && (cursorItemAttributeCount !== attributeCount)) { return false; }

    return Object.keys(requestedAttributes).every(key => {
      if (!storedAttributes.hasOwnProperty(key)) { return false; }

      const requestedValuesCount = requestedAttributes[key].length;
      const storedValues = storedAttributes[key] || [];
      if (exact && (requestedValuesCount !== storedValues.length)) { return false; }

      let matchCount = 0;
      requestedAttributes[key].forEach(reqVal => {
        if (storedValues.some(storeVal => storeVal === reqVal) ) { matchCount++; }
      });

      return matchCount === requestedValuesCount;
    });
  }
}
