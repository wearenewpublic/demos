import { StyleSheet, Text, View } from "react-native";
import { BackgroundBar, Clickable, MaybeClickable } from "./basics";
import { TranslatableLabel } from "./translation";
import { useState } from "react";


export function RatingWithLabel({value, labelSet, editable=false, placeholder, onChangeValue}) {
    const s = RatingWithLabelStyle;
    const label = value ? labelSet[value - 1] : placeholder;
    return <View style={s.row}>
        <SpectrumRating value={value} editable={editable} onChangeValue={onChangeValue} />
        <TranslatableLabel style={s.name} label={label} />
    </View>
}

const RatingWithLabelStyle = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        color: '#666',
        fontSize: 14,
        marginLeft: 8
    }
})

const colors = ['#f00', '#fa0', '#ff0', '#af0', '#0f0']

export function SpectrumRating({value, editable, onChangeValue}) {
    const s = SpectrumRatingStyle;
    const ratings = [1,2,3,4,5];
    // const hues = [0, 30, 60, 90, 120];

    return <View style={s.outer}>
        {ratings.map(rating =>
            <MaybeClickable key={rating} isClickable={editable && rating != value} 
                hoverStyle={{opacity: 0.5}}
                onPress={() => onChangeValue(rating)}>
                <SpectrumItem enabled={rating == value} color={colors[rating-1]}/>
            </MaybeClickable>
        )}
    </View>
}

function SpectrumItem({enabled, color}) {    
    if (enabled) {
        return <Dot size={20} color={color}  padSize={2} borderColor='#ccc' borderWidth={1} />
    } else {
        return <Dot size={10} color='#ccc' padSize={4} />
    }
}

const SpectrumRatingStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})

function Dot({size, color, borderColor, borderWidth, padSize}) {
    return <View style={{borderColor, borderWidth, backgroundColor: color, width: size, height: size, borderRadius: size/2, margin: padSize}} />
}

export function RatingSummary({labelSet, ratingCounts, selection, onChangeSelection }) {
    const ratings = [1,2,3,4,5];
    const maxCount = Math.max(...ratingCounts);
    const totalCount = ratingCounts.reduce((a,b) => a+b, 0);
    return <View>
        {ratings.map(rating =>
            <FilterCategoryItem key={rating} label={labelSet[rating-1]} color={colors[rating-1]} totalCount={totalCount} maxCount={maxCount} count={ratingCounts[rating-1]} category={rating} selection={selection} onChangeSelection={onChangeSelection} />
        )}
    </View>
}


export function FilterCategoryItem({label, maxCount, count, color, category, selection, onChangeSelection}) {
    const s = RatingSummaryItemStyle;
    const [hover, setHover] = useState(false);
    const selected = selection == category;
    function onSelect() {
        if (selected) {
            onChangeSelection(null);
        } else {
            onChangeSelection(category);
        }
    }
    if (hover) {
        console.log('hover');
    }
    const barWidth = (count / Math.max(maxCount, 10)) * 400
    return <Clickable onPress={onSelect} 
            style={selected ? s.selectedRow : s.row}
            hoverStyle={selected ? s.selectedRow : s.hoverRow}
            >
            <View style={s.dot}>
                <SpectrumItem enabled color={color}/>
            </View>
            <View style={s.right}>
                <TranslatableLabel style={s.label} label={label}/>
                <Text style={s.count}>{count}</Text>
                <BackgroundBar count={count} maxCount={maxCount} />
            </View>
    </Clickable>
}

const RatingSummaryItemStyle = StyleSheet.create({
    ratingBar: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        backgroundColor: '#ccc',
    },
    right: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        marginVertical: 4,
        marginLeft: 8
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    hoverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 4,
        // borderRadius: 12,
    },
    selectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 12,
        paddingHorizontal: 4,
        paddingVertical: 4
    },
    dot: {
        width: 24, height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#222',
        fontSize: 14,
        marginLeft: 8
    },
    count: {
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8
    }
})
