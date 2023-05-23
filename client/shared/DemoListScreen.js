import { StyleSheet, Text, View } from "react-native"
import { BigTitle, BodyText, Card, Center, Clickable, ScrollableScreen, SmallTitle, TimeText } from "../component/basics"
import { demos } from "../demo"
import { tagHues } from "../data/tags";
import { Entypo } from "@expo/vector-icons";
import React from 'react'

export function DemoListScreen({onSelectDemo}) {
    const s = DemoListScreenStyle;
    const sortedDemos = demos.sort((a, b) => b.date.localeCompare(a.date));
    return (
        <ScrollableScreen>
            <Center>
                <BigTitle>New Public Demo Garden</BigTitle>
            </Center>
            {sortedDemos.map(demo => 
                <Clickable key={demo.name} onPress={() => onSelectDemo(demo)}>
                    <Card>
                        <View style={s.authorLine}>
                            <SmallTitle>{demo.name}</SmallTitle>
                            <TimeText time={demo.date} />
                        </View>
                        {/* <AuthorLine author={demo.author} date={demo.date} /> */}
                        <BodyText>{demo.description}</BodyText>
                        <View style={s.extraLine}>
                            <TagList tags={demo.tags || []}/>
                            <Status status={demo.status} />
                        </View>
                    </Card>
                </Clickable>        
            )}
        </ScrollableScreen>
    )
}

const DemoListScreenStyle = StyleSheet.create({
    authorLine: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4
    },
    extraLine: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8
    }
});

function TagList({tags}) {
    const s = TagListStyle;
    return <View style={s.tagList}>
        {tags.map(tag => 
            <Tag key={tag.name} tag={tag} />
        )}
    </View>
}

const TagListStyle = StyleSheet.create({
    tagList: { 
        flexDirection: 'row', flexWrap: 'wrap', flex: 1
    }
});


function Tag({tag}) {
    const s = TagStyle;
    const hue = tagHues[tag.name] ?? 0;
    const color = 'hsl(' + Math.floor(hue) + ', 53%, 49%)';
    return <View style={[s.pill, {backgroundColor: color}]}>
        <Text style={s.label}>{tag.name}</Text>
    </View>
}

const TagStyle = StyleSheet.create({
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 16,
        marginRight: 8,
        marginTop: 4
    },
    label: {
        color: 'white',
        fontSize: 12
    }
});


function Status({status}) {
    const s = StatuStyle;
    if (!status) return null;
    return <View style={s.box}>
        {status.iconSet ? 
            React.createElement(status.iconSet, {name:status.iconName, style: s.icon})
        : null}
        {/* <Entypo style={s.icon} name={status.icon} /> */}
        <Text style={s.name}>{status.name}</Text>
    </View>
}

const StatuStyle = StyleSheet.create({
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderLeftColor: '#999',
        // borderLeftWidth: StyleSheet.hairlineWidth,
        marginLeft: 16,
        paddingHorizontal: 8,
        paddingVertical: 1,
        marginTop: 4,
        borderRadius: 4,
        borderColor: '#999',
        borderWidth: StyleSheet.hairlineWidth,
    },
    icon: {
        color: '#999',
        marginRight: 4
    },
    name: {
        fontSize: 12,
        color: '#444'
    }

});


