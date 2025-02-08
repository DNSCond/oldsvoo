// Learn more at developers.reddit.com/docs
import { Devvit, useState, svg } from '@devvit/public-api';
import { svgBuilder } from './assets-function.ts';

Devvit.configure({
  redditAPI: true,
  //redis: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My devvit post',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: create_preview(),
    });
    ui.navigateTo(post);
  },
});

function normalize_newlines(string: string) {
  return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
function indent_codeblock(string: string) {
  return '    ' + normalize_newlines(string).replace(/\n/g, '\n    ');
}
function create_preview() {
  return (
    <vstack height="100%" width="100%" alignment="middle center">
      <text size="large">Loading ...</text>
    </vstack>
  );
}

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const [iterator_, setIterator_] = useState(0);
    const [category, setcategory] = useState('none');
    //const [loadRedis, set_loadRedis] = useState(true);
    const [bottoms_iterator, set_bottoms_iterator] = useState(0);
    const [glasses_iterator, set_glasses_iterator] = useState(0);
    const [grippables_iterator, set_grippables_iterator] = useState(0);
    const [hats_iterator, set_hats_iterator] = useState(0);
    const [tops_iterator, set_tops_iterator] = useState(0);
    const iterators: any = {
      bottoms_iterator, set_bottoms_iterator,
      glasses_iterator, set_glasses_iterator,
      grippables_iterator, set_grippables_iterator,
      hats_iterator, set_hats_iterator,
      tops_iterator, set_tops_iterator,
    };
    //if(loadRedis){
    //set_loadRedis(false);
      
    //const currentUser = await context.reddit.getCurrentUser();
    //}
    const svgElement = svgBuilder(
      category,
      bottoms_iterator,
      glasses_iterator,
      grippables_iterator,
      hats_iterator,
      tops_iterator);
    function setNewCategory(newCat: string): any {
      return function () {
        if (category !== 'none') {
          iterators[`set_${category}_iterator`](iterators[`${category}_iterator`]);
        }
        setIterator_(iterators[`${category}_iterator`]);
        setcategory(newCat);
      };
    };
    function set_iterator(sign: "+" | "-"): any {
      return function (): void {
        const newItem = iterator_ + Number(`${sign}1`);
        setIterator_(newItem);
        if (category !== 'none') {
          iterators[`set_${category}_iterator`](newItem);
        }
      }
    }
    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image
          imageWidth={400}
          imageHeight={400}
          width="400px"
          height="300px"
          url={svgElement.output} />
        <hstack gap="medium">
          <button appearance="primary" onPress={set_iterator('-')}>
            &lt;
          </button>
          <text>{iterator_} / {String(svgElement[`${category}_bundle_length`] ?? '0')}</text>
          <button appearance="primary" onPress={set_iterator('+')}>
            &gt;
          </button>
        </hstack>
        <hstack gap="medium">
          <button appearance={category === 'bottoms' ? "primary" : "secondary"} onPress={setNewCategory('bottoms')}>bottoms</button>
          <button appearance={category === 'glasses' ? "primary" : "secondary"} onPress={setNewCategory('glasses')}>glasses</button>
          <button appearance={category === 'grippables' ? "primary" : "secondary"} onPress={setNewCategory('grippables')}>grippables</button>
          <button appearance={category === 'hats' ? "primary" : "secondary"} onPress={setNewCategory('hats')}>hats</button>
          <button appearance={category === 'tops' ? "primary" : "secondary"} onPress={setNewCategory('tops')}>tops</button>
        </hstack>
        <hstack gap="medium">
          <button appearance="success" disabled={true} onPress={async function () {/*
            const currentUser = await context.reddit.getCurrentUser();
            if (currentUser) {
              context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
              const post = await context.reddit.submitPost({
                title: `u/${currentUser.username}'s new snoo (${context.appVersion})`,
                subredditName: (await context.reddit.getCurrentSubreddit()).name,
                preview: create_preview(),
              });
              context.redis.set(`user-iterator-${currentUser.id}`, JSON.stringify({
                bottoms_iterator, glasses_iterator, grippables_iterator, hats_iterator, tops_iterator
              }));
              context.ui.navigateTo(post);
            } else {
              context.ui.showToast("Sorry. only accounts with username can post");
            }*/}}>share it! (make a post about it)</button>
        </hstack>
      </vstack >
    );
  },
});

export default Devvit;

