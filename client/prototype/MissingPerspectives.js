import { useState } from "react";
import { authorRobEnnals } from "../data/authors";
import { post_starwars } from "../data/posts";
import { statusTentative } from "../data/tags";
import { useCollection, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { expandDataList } from "../util/util";
import { BigTitle, Card, Pad, Pill, ScrollableScreen, SectionTitle } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { PostInput } from "../component/replyinput";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import { squaremapNamesUsa, squaremapUsa } from "../data/squaremaps";
import { SquareMap } from "../component/squaremap";
import { PopupSelector } from "../platform-specific/popup";

export const MissingPerspectivesPrototype = {
    key: 'missingperspectives',
    date: 'Wed Jul 26 2023 20:50:03 GMT-0700 (Pacific Daylight Time)',
    name: 'Missing Perspectives',
    author: authorRobEnnals,
    description: 'Show a map that illustrates where we are hearing opinions from, and where we are not',
    tags: [],
    status: statusTentative,
    screen: MissingPerspectivesScreen,
    instance: [
        {
            key: 'wars', name: 'Star Wars',
            regions: squaremapUsa, regionNames: squaremapNamesUsa,
            question: 'Which is better. Star Wars or Star Trek?',
            sideOne: 'Pro Star Wars',
            sideTwo: 'Pro Star Trek',
            post: expandDataList(post_starwars)
        }
    ]
}

function MissingPerspectivesScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const question = useGlobalProperty('question');
    const regions = useGlobalProperty('regions');
    const regionNames = useGlobalProperty('regionNames');
    const personaKey = usePersonaKey();
    const [selection, setSelection] = useState(null);
    const hasAnswered = posts.some(post => post.from == personaKey);

    var shownPosts = posts;
    if (selection) {
        shownPosts = posts.filter(post => post.region == selection);
    }

    return <ScrollableScreen grey>
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage text='You have already written an opinion' />
        :
            <PostInput placeholder="What's your opinion?"  topWidgets={[EditRegion]} />
        }

        <Card>
            <SectionTitle text='Filter by Region' />
            <Pad/>
            <SquareMap regions={regions} regionNames={regionNames} posts={posts} selection={selection} onChangeSelection={setSelection} />
        </Card>

        {selection ?
            <QuietSystemMessage text='Showing only posts from {regionName}' formatParams={{regionName: regionNames[selection]}} />
        :null}

        {shownPosts.map(post => 
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionEdit]}
                editWidgets={[EditRegion]}
                topBling={<RegionBling region={post.region} regionNames={regionNames} />}
            />
        )}
    </ScrollableScreen>
}

function RegionBling({region, regionNames}) {
    return <Pill label={region + ': ' + (regionNames[region] ?? 'Unknown Region')} color='black' />
}


function EditRegion({post, onPostChanged}) {
    const regionNames = useGlobalProperty('regionNames');
    const regionItems = Object.keys(regionNames).map(key => ({key, label: key + ': ' + regionNames[key]}));
    const unknown = {key: 'unknown', label: 'Select your region'};

    return <PopupSelector value={post.region} items={[unknown, ...regionItems]} 
        onSelect={region => onPostChanged({...post, region})} /> 
}
