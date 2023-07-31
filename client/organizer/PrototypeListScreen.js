import { ScrollView, StyleSheet, Text, View } from "react-native"
import { BigTitle, BodyText, Card, Center, Clickable, Narrow, Pill, PreviewText, ScrollableScreen, Separator, SmallTitleLabel, TimeText } from "../component/basics"
import { prototypes } from "../prototype"
import { tagHues } from "../data/tags";
import { Entypo } from "@expo/vector-icons";
import React, { useState } from 'react'
import { NewPublicBodySection, NewPublicName, NewPublicTitle, NewPublicTitleBanner, colorNewPublicBackground } from "../component/newpublic";
import { WebLink } from "../platform-specific/url";
import { makePrototypeUrl } from "../util/navigate";

export function PrototypeListScreen({onSelectPrototype}) {
    const s = PrototypeListScreenStyle;
    const sortedPrototypes = prototypes.sort((a, b) => new Date(b.date).valueOf() -  new Date(a.date).valueOf());
    const [tagFilters, setTagFilters] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);

    function onAddTag(tag) {
        if (tagFilters.includes(tag)) return;
        setTagFilters(tagFilters.concat(tag));
    }

    function onRemoveTag(tag) {
        setTagFilters(tagFilters.filter(t => t !== tag));
    }

    const filteredPrototypes = getFilteredPrototypes({prototypes: sortedPrototypes, tagFilters, statusFilter});

    return (
        <ScrollView>
            <NewPublicTitleBanner>
                <NewPublicName>New_ Public</NewPublicName>
                <NewPublicTitle>Prototype Garden</NewPublicTitle>
            </NewPublicTitleBanner>
            <NewPublicBodySection>
                <Narrow>
                    <SelectedTagList tags={tagFilters} status={statusFilter} 
                        onRemoveTag={onRemoveTag} 
                        onClearStatusFilter={() => setStatusFilter(null)}/>
                {filteredPrototypes.map(prototype => 
                    <WebLink key={prototype.name} url={makePrototypeUrl(prototype.key)}>
                    {/* <Clickable key={prototype.name} onPress={() => onSelectPrototype(prototype)}> */}
                        <Card>
                            <View style={s.authorLine}>
                                <SmallTitleLabel label={prototype.name}/>
                                <TimeText time={prototype.date} />
                            </View>
                            {/* <AuthorLine author={prototype.author} date={prototype.date} /> */}
                            <PreviewText text={prototype.description} />
                            <View style={s.extraLine}>
                                <TagList tags={prototype.tags || []} onAddTag={onAddTag} />
                                <Status status={prototype.status} onSelectStatus={setStatusFilter} />
                            </View>
                        </Card>
                    </WebLink>
                    // </Clickable>        
                )}
                </Narrow>
            </NewPublicBodySection>
        </ScrollView>
    )
}

const PrototypeListScreenStyle = StyleSheet.create({
    authorLine: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4
    },
    extraLine: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8
    }
});

function getFilteredPrototypes({prototypes, tagFilters, statusFilter}) {
    if (tagFilters.length === 0 && !statusFilter) return prototypes;
    const hasTags = prototypes.filter(prototype => 
        tagFilters.every(tag => prototype.tags.includes(tag) || prototype.status === tag)
    )
    const hasStatusAndTags = hasTags.filter(prototype => prototype.status === statusFilter || !statusFilter);
    return hasStatusAndTags
    // return prototypes.filter(prototype => prototype.tags.some(tag => tagFilters.includes(tag) || prototype.status === tag));
}



function SelectedTagList({tags, status, onRemoveTag, onClearStatusFilter}) {
    const s = SelectedTagListStyle;
    if (tags.length === 0 && !status) return null;
    return <View style={s.tagList}>
        {/* <Text style={s.labelText}>Filters:</Text> */}
        {status ? 
            <Status big showCross status={status} onSelectStatus={onClearStatusFilter} />
        : null}
        {tags.map(tag => 
            <Clickable key={tag.name} onPress={() => onRemoveTag(tag)}>
                <Pill big showCross label={tag.name} color={getTagColor(tag)} />
            </Clickable>
        )}
    </View>
}

const SelectedTagListStyle = StyleSheet.create({
    tagList: { 
        flexDirection: 'row', flexWrap: 'wrap', flex: 1,
        marginLeft: 16
    },
    labelText: {
        fontSize: 18, color: '#666', marginRight: 8, marginTop: 4
    }
});


function TagList({tags, onAddTag}) {
    const s = TagListStyle;
    return <View style={s.tagList}>
        {tags.map(tag => 
            <Clickable key={tag.name} onPress={() => onAddTag(tag)}>
                <Pill label={tag.name} color={getTagColor(tag)} />
            </Clickable>
        )}
    </View>
}

const TagListStyle = StyleSheet.create({
    tagList: { 
        flexDirection: 'row', flexWrap: 'wrap', flex: 1
    }
});

function getTagColor(tag) {
    const hue = tagHues[tag.name] ?? 0;
    return 'hsl(' + Math.floor(hue) + ', 30%, 50%)';   
}


function StatusFilter({status, onClearStatusFilter}) {
    if (!status) return null;
    return <View>
    </View>
}

function Status({status, big=false, showCross=false, onSelectStatus}) {
    const s = StatuStyle;
    if (!status) return null;
    return <Clickable onPress={() => onSelectStatus(status)}> 
        <View style={[big ? s.bigBox : s.box, showCross ? {paddingRight: 4} : null]}>
            {status.iconSet ? 
                React.createElement(status.iconSet, {name:status.iconName, style: s.icon})
            : null}
            <Text style={big ? s.bigName : s.name}>{status.name}</Text>
            {showCross ? 
                <Entypo name='cross' size={big ? 18 : 12} color='#444' />
            : null}
        </View>
    </Clickable>
}

const StatuStyle = StyleSheet.create({
    bigBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        // marginTop: 4,
        borderRadius: 4,
        borderColor: '#999',
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: 'white',
        marginRight: 8,
        marginBottom: 4
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
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
    bigName: {
        fontSize: 16,
        marginRight: 4,
        color: '#444'
    },
    name: {
        fontSize: 12,
        color: '#444'
    }

});


