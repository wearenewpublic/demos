import { View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { Card, Narrow, Pill, SectionTitleLabel } from "../component/basics";
import { gptProcessAsync } from "../component/chatgpt";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import { FilterCategoryItem } from "../component/rating";
import { PostInput } from "../component/replyinput";
import { godzilla_article, godzilla_category_posts } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection } from "../util/datastore";
import { expandDataList, toTitleCase } from "../util/util";
import { useState } from "react";

export const CategorizedPostsPrototype = {
    description: 'Categorize posts as Fact/Experience/Proposal/Opinion/Other',
    name: 'Categorized Posts',
    key: 'categorizedposts',
    author: authorRobEnnals,
    date: '2023-08-17',
    screen: CategorizedPostsScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla Article', article: godzilla_article, post: expandDataList(godzilla_category_posts)},
        {key: 'godzilla-raw', name: 'Godzilla Raw', title: 'What should we do about Godzilla attackin New York?', 
            post: expandDataList(godzilla_category_posts)
        }

    ]   
}

function CategorizedPostsScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const [selection, setSelection] = useState(null);
    const filteredPosts = selection ? posts.filter(post => post.category == selection) : posts;

    // console.log('posts', posts);

    return <MaybeArticleScreen articleChildLabel='Responses'>
        <Narrow>
            <PostInput placeholder={"What do you want to contribute?"}
                postHandler={postHandlerAsync} />

            <Card>
                <SectionTitleLabel label='Filter by Post Type' />
                <CategoryFilter posts={posts} selection={selection} onChangeSelection={setSelection} />
            </Card>

            {filteredPosts.map(post => 
                <Post key={post.key} post={post} saveHandler={postHandlerAsync}
                    actions={[PostActionLike, PostActionEdit]}
                    topBling={<PostCategoryBling post={post} />}
                />
            )}
        </Narrow>
    </MaybeArticleScreen>
}

const categoryColors = {
    'fact': 'blue',
    'unverified fact': 'red',
    'experience': 'green',
    'proposal': 'orange',
    'opinion': 'purple',
    'other': 'grey',
    'null': 'grey'
}

function PostCategoryBling({post}) {
    const color = categoryColors[post.category || 'null'];
    return <Pill big color={color} label={toTitleCase(post.category || 'Processing...')} />
}

async function postHandlerAsync({datastore,postKey, post}) {
    var key;
    if (postKey) {
        key = postKey;
        await datastore.setObject('post', key, {...post, category: null});
    } else {
        key = await datastore.addObject('post', post);
    }

    const result = await gptProcessAsync({promptKey: 'post_category', params: {text: post.text}});
    await datastore.updateObject('post', key, {category: result.judgement});
}

function CategoryFilter({posts, selection, onChangeSelection}) {
    const counts = getCategoryCounts(posts);
    const categories = ['fact', 'unverified fact', 'experience', 'proposal', 'opinion', 'other'];
    const maxCount = Math.max(...Object.values(counts));
    return <View>
        {categories.map(category =>
            <FilterCategoryItem key={category} label={toTitleCase(category)} 
                category={category} maxCount={maxCount}
                count={counts[category] || 0} color={categoryColors[category]}
                selection={selection} onChangeSelection={onChangeSelection}
            />
        )}
    </View>
}

function getCategoryCounts(posts) {
    var counts = {};
    for (const post of posts) {
        counts[post.category] = (counts[post.category] || 0) + 1;
    }
    return counts;
}
