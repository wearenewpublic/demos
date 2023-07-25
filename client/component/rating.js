import { StyleSheet, View } from "react-native";
import { Clickable, MaybeClickable } from "./basics";
import { TranslatableText } from "./translation";


export function RatingWithLabel({value, labelSet, editable=false, onChangeValue}) {
    const s = RatingWithLabelStyle;
    const label = labelSet[value - 1];
    return <View style={s.row}>
        <SpectrumRating value={value} editable={editable} onChangeValue={onChangeValue} />
        <TranslatableText style={s.name} text={label} />
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


export function SpectrumRating({value, editable, onChangeValue}) {
    const s = SpectrumRatingStyle;
    const ratings = [1,2,3,4,5];
    // const hues = [0, 30, 60, 90, 120];
    const colors = ['#f00', '#fa0', '#ff0', '#af0', '#0f0']

    return <View style={s.outer}>
        {ratings.map(rating =>
            <MaybeClickable key={rating} isClickable={editable} 
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