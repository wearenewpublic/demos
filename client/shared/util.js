
export function expandDataList(list) {
    const date = new Date();
    date.setHours(date.getHours() - 1);

    return list.map((item, index) => {
        date.setMinutes(date.getMinutes + 1);
        return {
            ...item,
            key: index,
            time: date.getTime()
        };
    });
}

