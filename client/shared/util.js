
export function expandDataList(list) {
    return list.map((item, index) => {
        return {
            ...item,
            key: index,
        };
    });
}

