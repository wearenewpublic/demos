import { StyleSheet, Text, View } from "react-native";
import { BackgroundBar, Clickable } from "./basics";

export function SquareMap({regions, regionNames, posts, selection, binary=false, onChangeSelection}) {
    const s = SquareMapStyle;
    const regionRows = regions.split('\n').filter(x=>x);
    const regionCounts = getRegionCounts(posts);
    const maxCount = Math.max(...Object.values(regionCounts));

    return <View style={s.outer}>
        {regionRows.map((row, rowIndex) => 
            <RegionRow key={rowIndex} row={row} binary={binary} rowIndex={rowIndex} regionCounts={regionCounts} maxCount={maxCount} regionNames={regionNames} selection={selection} onChangeSelection={onChangeSelection} />
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

function RegionRow({row, rowIndex, binary, regionNames, regionCounts, maxCount, selection, onChangeSelection}) {
    const regionKeys = row.split(',');
    return <View style={{flexDirection: 'row'}}>
        {regionKeys.map((regionKey, regionIndex) => 
            <RegionCell key={regionIndex} binary={binary} regionKey={regionKey} regionNames={regionNames} regionCounts={regionCounts} maxCount={maxCount} selection={selection} onChangeSelection={onChangeSelection} />
        )}
    </View>
}

function RegionCell({regionKey, regionNames, binary, regionCounts, maxCount, selection, onChangeSelection}) {
    const s = RegionCellStyles;
    const selected = selection == regionKey;
    const count = regionCounts[regionKey];
    if (regionKey.trim() == '') return <View style={s.emptyCell} />
    if (binary) {
        return <Clickable onPress={() => onChangeSelection(selected ? null : regionKey)}
                hoverStyle={!selected ? s.hover : null}
                style={[s.cell, count ? s.activeCell : null, selected ? s.selectedCell : null]}>
            <Text style={s.label}>{regionKey}</Text>
            <BackgroundBar count={regionCounts[regionKey] ?? 0} maxCount={maxCount} />
        </Clickable>
    } else {
        return <Clickable onPress={() => onChangeSelection(selected ? null : regionKey)} 
                hoverStyle={s.hover}
                style={[s.cell, selected ? s.selectedCell : null]}>
            <Text style={s.label}>{regionKey}</Text>
            <BackgroundBar count={count ?? 0} maxCount={maxCount} />
        </Clickable>
    }
}

const RegionCellStyles = StyleSheet.create({
    hover: {
        borderColor: '#999'
    },
    cell: {
        width: 28,
        height: 28,
        backgroundColor: '#eee',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 1
    } ,
    activeCell: {
        backgroundColor: '#77C7F6'
    },
    selectedCell: {
        borderWidth: 3,
        // borderColor: '#77C7F6',
        borderColor: '#444',
        borderRadius: 8,
        margin: 1,
    },
    emptyCell: {
        width: 28,
        height: 28,
        margin: 1
    },
    label: {
        fontSize: 12
    }
}) 

