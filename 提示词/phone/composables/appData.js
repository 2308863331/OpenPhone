import { reactive } from 'vue'

export const desktopApps = reactive([
  { uid: 'd1', label: 'Messages', icon: 'msg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', size: 'standard', badge: 3, page: 'chatlist', navType: 'internal' },
  { uid: 'd2', label: '行事曆', icon: 'widget-clock', gradient: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 50%, #7fcdbb 100%)', size: 'large', page: null, navType: null },
  { uid: 'd3', label: '深夜食堂', icon: 'msg', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: 'standard', page: 'diner', navType: 'external' },
  { uid: 'd4', label: '锦书', icon: 'instagram', gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', size: 'standard', page: 'romantic', navType: 'external' },
  { uid: 'd5', label: '电台', icon: 'widget-photo', gradient: 'transparent', size: 'large', page: 'radio', navType: 'external' },
  { uid: 'd6', label: '红线', icon: 'cameraRoll', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', size: 'standard', page: 'fate', navType: 'external' },
  { uid: 'd7', label: '织梦', icon: 'photo', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', size: 'standard', page: 'dreamweaver', navType: 'external' },
  { uid: 'd8', label: '相册', icon: 'widget-circle', gradient: 'linear-gradient(135deg, rgba(200,220,210,0.5) 0%, rgba(180,200,190,0.45) 50%, rgba(160,185,175,0.4) 100%)', size: 'large', page: 'photo', navType: 'external' },
  { uid: 'd9', label: '漂流瓶', icon: 'msg', gradient: 'linear-gradient(135deg, #07c160 0%, #06ae56 100%)', size: 'standard', page: 'bottle', navType: 'external' },
  { uid: 'd10', label: '萤火', icon: 'widget-book', gradient: 'transparent', size: 'standard', page: 'firefly', navType: 'external' },
  { uid: 'd11', label: '秘闻墙', icon: 'msg', gradient: 'linear-gradient(135deg, #12b7f5 0%, #0d8ecf 100%)', size: 'standard', page: 'mystery-new', navType: 'external' },
  { uid: 'd12', label: '时间胶囊', icon: 'capsule', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', size: 'standard', page: 'timecapsule', navType: 'external' },
  { uid: 'd13', label: '时光当铺', icon: 'pawnshop', gradient: 'linear-gradient(135deg, #d4a574 0%, #c9956a 100%)', size: 'standard', page: 'timetransaction', navType: 'external' },
  { uid: 'd14', label: '旅行日记', icon: 'travel', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', size: 'standard', page: 'travel', navType: 'external' },
  { uid: 'd15', label: '秘密基地', icon: 'treehouse', gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', size: 'standard', page: 'treehouse', navType: 'external' },
  { uid: 'd16', label: '视频播放', icon: 'video', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', size: 'standard', page: 'videoplayer', navType: 'external' },
  { uid: 'd17', label: '锦书伴侣', icon: 'companion', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', size: 'standard', page: 'companion', navType: 'external' },
  { uid: 'd18', label: '气象水晶', icon: 'crystal', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', size: 'standard', page: 'weathercrystal', navType: 'external' },
  { uid: 'd19', label: '粒子墙', icon: 'particle', gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', size: 'standard', page: 'mystery-old', navType: 'external' }
])

export const dockApps = [
  { uid: 'dock1', label: 'Phone', icon: 'phone', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', page: null, navType: null },
  { uid: 'dock2', label: '朋友圈', icon: 'photo', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', page: 'moments', navType: 'internal' },
  { uid: 'dock3', label: 'Messages', icon: 'msg', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', page: 'chatlist', navType: 'internal' }
]

export const conversations = reactive([
  {
    id: 'c1',
    name: '林深',
    initial: '林',
    avatarGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    time: 'now',
    lastMessage: '你话有点多了',
    unreadCount: null,
    unread: false
  },
  {
    id: 'c2',
    name: '海盐',
    initial: '海',
    avatarGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    time: '2h ago',
    lastMessage: '今天的海很好看',
    unreadCount: 2,
    unread: true
  },
  {
    id: 'c3',
    name: '岛屿',
    initial: '岛',
    avatarGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    time: '5h ago',
    lastMessage: '[图片]',
    unreadCount: null,
    unread: false
  },
])

const chatDataMap = {
  c1: [
    { text: '然后呢。', isMe: false },
    { text: '过来', isMe: true },
    { text: '找我，听不懂？', isMe: true },
    { text: '以什么身份。', isMe: false },
    { text: '情人', isMe: true },
    { text: '呵。', isMe: false },
    { text: '你把他置于何地。', isMe: false },
    { text: '死地', isMe: true },
    { text: '你对感情，一直这么随意？', isMe: false },
    { text: '你话有点多了', isMe: true },
    { text: '怕我说中什么？', isMe: false }
  ],
  c2: [
    { text: '今天的海很好看', isMe: false },
    { text: '发来看看', isMe: true },
    { text: '你自己来看', isMe: false }
  ],
  c3: [
    { text: '[图片]', isMe: false },
    { text: '好看！', isMe: true }
  ]
}

export function getChatMessages(convId) {
  return chatDataMap[convId] || []
}

export const momentsFeed = reactive([
  {
    id: 'p1',
    author: '林深',
    initial: '林',
    authorGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    timestamp: '2h ago',
    content: '雨天的咖啡馆\n窗边的位置刚好可以看到街角的梧桐\n拿铁上的拉花还没散\n这样安静的下午刚刚好',
    images: ['linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'],
    likes: 7734,
    comments: 1611,
    saves: 2159,
    isLiked: false
  },
  {
    id: 'p2',
    author: '海盐',
    initial: '海',
    authorGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    timestamp: '5h ago',
    content: '日落之前到达海边\n橘色的光铺满整个海面\n风把头发吹得乱七八糟\n但没关系 这就是夏天的样子',
    images: ['linear-gradient(135deg, #fa709a 0%, #fee140 100%)'],
    likes: 2453,
    comments: 892,
    saves: 1024,
    isLiked: true
  },
  {
    id: 'p3',
    author: '岛屿',
    initial: '岛',
    authorGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    timestamp: '8h ago',
    content: '新入手的胶片机\n第一卷拍了一些日常\n冲洗出来的色彩比想象中温柔\n下次想去老城区拍一组',
    images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'],
    likes: 5321,
    comments: 743,
    saves: 1892,
    isLiked: false
  }
])
