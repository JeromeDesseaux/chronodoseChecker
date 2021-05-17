const filterOptionsValues = (values: string[], vaccineNames: string[], injectionNumber: number = 1 | 2): string[] => {
    const injectionNumberString = injectionNumber === 1 ? "1re" : "2nd";
    const newValues: string[] = [];

    values.map(value => {
        vaccineNames.map(vn => {
            if (value.includes(injectionNumberString) && value.toLowerCase().includes(vn.toLowerCase())) {
                newValues.push(value);
            }
        })
    })
    return newValues;
}

export {
    filterOptionsValues
}