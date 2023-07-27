import { StyleSheet, Text, View } from "react-native";
import { BackgroundBar, Clickable } from "./basics";

export function SquareMap({regions, regionNames, posts, selection, onChangeSelection}) {
    const s = SquareMapStyle;
    const regionRows = regions.split('\n').filter(x=>x);
    const regionCounts = getRegionCounts(posts);
    const maxCount = Math.max(...Object.values(regionCounts));

    return <View style={s.outer}>
        {regionRows.map((row, rowIndex) => 
            <RegionRow key={rowIndex} row={row} rowIndex={rowIndex} regionCounts={regionCounts} maxCount={maxCount} regionNames={regionNames} selection={selection} onChangeSelection={onChangeSelection} />
        )}
    </View>
}

function getRegionCounts(posts) {
    var regionCounts = {};
    for (const post of posts) {
        regionCounts[post.region] = (regionCounts[post.region] ?? 0) + 1;
    }
    return regionCounts;
}

const SquareMapStyle = StyleSheet.create({
    outer: {
        alignSelf: 'center'
    }
})

function RegionRow({row, rowIndex, regionNames, regionCounts, maxCount, selection, onChangeSelection}) {
    const regionKeys = row.split(',');
    return <View style={{flexDirection: 'row'}}>
        {regionKeys.map((regionKey, regionIndex) => 
            <RegionCell key={regionIndex} regionKey={regionKey} regionNames={regionNames} regionCounts={regionCounts} maxCount={maxCount} selection={selection} onChangeSelection={onChangeSelection} />
        )}
    </View>
}

function RegionCell({regionKey, regionNames, regionCounts, maxCount, selection, onChangeSelection}) {
    const s = RegionCellStyles;
    const selected = selection == regionKey;
    if (regionKey.trim() == '') return <View style={s.emptyCell} />
    return <Clickable onPress={() => onChangeSelection(selected ? null : regionKey)}> 
        <View style={[s.cell, selected ? s.selectedCell : null]}>
            <Text style={s.label}>{regionKey}</Text>
            <BackgroundBar count={regionCounts[regionKey] ?? 0} maxCount={maxCount} />
        </View>
    </Clickable>
}

const RegionCellStyles = StyleSheet.create({
    cell: {
        width: 32,
        height: 32,
        backgroundColor: '#eee',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2
    } ,
    selectedCell: {
        borderWidth: 3,
        // borderColor: '#77C7F6',
        borderColor: '#444',
        margin: 2,
    },
    emptyCell: {
        width: 32,
        height: 32,
        margin: 2
    }
}) 

