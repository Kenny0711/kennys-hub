import { LeetcodeRecord, Project } from './types';

export const LEGACY_MOCK_PROJECTS: Project[] = [
  {
    id: 'project-maskgit',
    title: 'DLP: MaskGiT',
    project_url: 'https://github.com/Kenny0711',
    description:
      'A visual research build that studies masked token generation, iterative decoding, and image synthesis workflows for deep learning practice.',
    image_url: '/projects/maskgit.svg',
    tags: ['PyTorch', 'Transformer', 'DLP'],
    is_featured: true,
  },
  {
    id: 'project-continual-rl',
    title: 'Unforgetting: Continual RL',
    project_url: 'https://github.com/Kenny0711',
    description:
      '強化學習交通控制研究，聚焦 continual learning、policy retention，以及多場景交通號誌策略的穩定遷移。',
    image_url: '/projects/continual-rl.svg',
    tags: ['RL', 'PyTorch', 'SUMO'],
    is_featured: true,
  },
  {
    id: 'project-leetcode-tracker',
    title: 'LeetCode Learning Tracker',
    project_url: 'https://github.com/Kenny0711/vibe-leetcode',
    description:
      '本專案開發紀錄：Chrome Extension、Supabase、Next.js dashboard 與刷題複習流程整合。',
    image_url: '/projects/dev-hub.svg',
    tags: ['Next.js', 'Supabase', 'TypeScript'],
    is_featured: true,
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'dlp-backpropagation',
    title: 'Backpropagation from Scratch',
    description:
      'Goal: Build and train a fully connected neural network from scratch using only Python and NumPy. This project focuses on understanding the mechanics behind forward propagation, manual backpropagation, activation functions, SGD, and momentum-based optimization by validating the model on XOR and linear classification tasks.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%201',
    image_url: '/projects/backpropagation.svg',
    tags: ['NumPy', 'Backpropagation', 'MLP'],
    is_featured: false,
  },
  {
    id: 'dlp-semantic-segmentation',
    title: 'Binary Semantic Segmentation',
    description:
      'Goal: Train image segmentation models that can separate pet foregrounds from backgrounds on the Oxford-IIIT Pet dataset. The implementation compares UNet and ResNet34-UNet, builds the full PyTorch training and evaluation pipeline, and uses Dice score plus inference outputs to measure segmentation quality.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%202',
    image_url: '/projects/segmentation.svg',
    tags: ['PyTorch', 'UNet', 'Segmentation'],
    is_featured: true,
  },
  {
    id: 'dlp-maskgit-inpainting',
    title: 'MaskGIT Image Inpainting',
    description:
      'Goal: Use a pretrained VQGAN tokenizer with a Masked Bidirectional Transformer to reconstruct masked image regions through iterative token prediction. The work explores mask scheduling, transformer-based visual token modeling, image inpainting inference, and FID-based evaluation of generative quality.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%203',
    image_url: '/projects/maskgit.svg',
    tags: ['PyTorch', 'VQGAN', 'Transformer'],
    is_featured: true,
  },
  {
    id: 'dlp-conditional-vae-video',
    title: 'Conditional VAE Video Prediction',
    description:
      'Goal: Implement stochastic video generation with a learned prior to predict future dance frames from conditional signals. This project studies Conditional VAE training, the reparameterization trick, KL annealing, teacher forcing schedules, reconstruction loss, and PSNR evaluation over long video sequences.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%204',
    image_url: '/projects/video-vae.svg',
    tags: ['PyTorch', 'CVAE', 'Video Prediction'],
    is_featured: false,
  },
  {
    id: 'dlp-dqn-control',
    title: 'Deep Q-Network Control',
    description:
      'Goal: Implement Deep Q-Network agents and variants for discrete control tasks. The project emphasizes reinforcement learning fundamentals including experience replay, target networks, value estimation, exploration, evaluation rollouts, and recorded videos that make policy behavior easier to inspect.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%205',
    image_url: '/projects/dqn-control.svg',
    tags: ['PyTorch', 'DQN', 'Reinforcement Learning'],
    is_featured: false,
  },
  {
    id: 'dlp-conditional-ddpm',
    title: 'Conditional DDPM Image Generation',
    description:
      'Goal: Build a conditional denoising diffusion model that generates iCLEVR images from multi-label object conditions. The implementation combines a conditional UNet, cosine noise scheduling, classifier-free guidance, AdamW training, inference scale sweeps, and evaluator-based accuracy checks.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/lab%206',
    image_url: '/projects/ddpm-generation.svg',
    tags: ['PyTorch', 'Diffusion', 'Generative AI'],
    is_featured: true,
  },
  {
    id: 'dlp-sumo-lcpo',
    title: 'SUMO Traffic Simulation with LCPO',
    description:
      'Goal: Apply reinforcement learning to traffic signal control using SUMO and a Taipei road network. The project connects simulation engineering with RL policy design by building road topology from real data, constructing SUMO scenarios, and evaluating adaptive signal-control agents in traffic environments.',
    project_url: 'https://github.com/Kenny0711/Nycu-Deep-learning-2026/tree/main/final',
    image_url: '/projects/sumo-lcpo.svg',
    tags: ['SUMO', 'RL', 'Traffic Simulation'],
    is_featured: true,
  },
];

export const MOCK_RECORDS: LeetcodeRecord[] = [
  {
    id: 'mock-1',
    problem_id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    proficiency: '熟練',
    solutions: [
      {
        method: 'Hash Map',
        code: `def twoSum(self, nums: List[int], target: int) -> List[int]:
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`,
        language: 'python',
        time_complexity: 'O(n)',
        space_complexity: 'O(n)',
        notes: '一次遍歷，用 hash map 記錄已看過的值。key = 數字，value = index。',
      },
    ],
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'mock-2',
    problem_id: 53,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'DP', 'Divide and Conquer'],
    proficiency: '理解',
    solutions: [
      {
        method: "Kadane's Algorithm",
        code: `def maxSubArray(self, nums: List[int]) -> int:
    cur = best = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,
        language: 'python',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        notes: "Kadane's：每步決定「要不要帶上之前的 subarray」。\n\n`cur = max(n, cur + n)` 代表：從這裡重新開始 vs 繼續延伸。",
      },
    ],
    created_at: '2026-01-20T14:00:00Z',
    updated_at: '2026-01-22T09:00:00Z',
  },
  {
    id: 'mock-3',
    problem_id: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Graph', 'BFS', 'DFS', 'Union Find'],
    proficiency: '生疏',
    solutions: [
      {
        method: 'DFS Flood Fill',
        code: `def numIslands(self, grid: List[List[str]]) -> int:
    def dfs(r, c):
        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]):
            return
        if grid[r][c] == "0":
            return
        grid[r][c] = "0"
        dfs(r+1, c); dfs(r-1, c)
        dfs(r, c+1); dfs(r, c-1)

    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == "1":
                dfs(r, c)
                count += 1
    return count`,
        language: 'python',
        time_complexity: 'O(m×n)',
        space_complexity: 'O(m×n)',
        notes: 'DFS flood fill，遇到陸地就沉掉（改成 "0"），避免重複計算。',
      },
    ],
    created_at: '2026-02-05T11:00:00Z',
    updated_at: '2026-02-05T11:00:00Z',
  },
  {
    id: 'mock-4',
    problem_id: 322,
    title: 'Coin Change',
    difficulty: 'Medium',
    tags: ['DP', 'BFS'],
    proficiency: '理解',
    solutions: [
      {
        method: 'Bottom-up DP',
        code: `def coinChange(self, coins: List[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
        language: 'python',
        time_complexity: 'O(amount × n)',
        space_complexity: 'O(amount)',
        notes: '`dp[i]` = 湊出金額 i 最少需要幾枚硬幣。每個金額從所有硬幣面額遞推。',
      },
    ],
    created_at: '2026-02-10T16:00:00Z',
    updated_at: '2026-02-10T16:00:00Z',
  },
  {
    id: 'mock-5',
    problem_id: 295,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    tags: ['Heap', 'Design', 'Two Pointers'],
    proficiency: '生疏',
    solutions: [],
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'mock-6',
    problem_id: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Sliding Window', 'String'],
    proficiency: '熟練',
    solutions: [
      {
        method: 'Sliding Window',
        code: `def lengthOfLongestSubstring(self, s: str) -> int:
    char_set = set()
    left = res = 0
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        res = max(res, right - left + 1)
    return res`,
        language: 'python',
        time_complexity: 'O(n)',
        space_complexity: 'O(n)',
        notes: 'Sliding window + set。右指針擴張，遇到重複就縮左指針直到不重複。',
      },
    ],
    created_at: '2026-03-10T09:00:00Z',
    updated_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'mock-7',
    problem_id: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'DP'],
    proficiency: '熟練',
    solutions: [
      {
        method: 'One Pass',
        code: `def maxProfit(self, prices: List[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        min_price = min(min_price, p)
        max_profit = max(max_profit, p - min_price)
    return max_profit`,
        language: 'python',
        time_complexity: 'O(n)',
        space_complexity: 'O(1)',
        notes: '一次遍歷，記錄最低買入價，同時更新最大利潤。',
      },
    ],
    created_at: '2026-03-15T14:00:00Z',
    updated_at: '2026-03-15T14:00:00Z',
  },
  {
    id: 'mock-8',
    problem_id: 76,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    tags: ['Hash Table', 'Sliding Window', 'String'],
    proficiency: '生疏',
    solutions: [],
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'mock-9',
    problem_id: 207,
    title: 'Course Schedule',
    difficulty: 'Medium',
    tags: ['Graph', 'BFS', 'DFS', 'Topological Sort'],
    proficiency: '理解',
    solutions: [
      {
        method: 'Topological Sort (BFS)',
        code: `def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
    in_degree = [0] * numCourses
    graph = defaultdict(list)
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1
    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    count = 0
    while queue:
        node = queue.popleft()
        count += 1
        for nei in graph[node]:
            in_degree[nei] -= 1
            if in_degree[nei] == 0:
                queue.append(nei)
    return count == numCourses`,
        language: 'python',
        time_complexity: 'O(V+E)',
        space_complexity: 'O(V+E)',
        notes: 'Kahn\'s Algorithm：用 in-degree 判斷是否有環。如果可以修完所有課程，代表圖中無環。',
      },
    ],
    created_at: '2026-04-10T16:00:00Z',
    updated_at: '2026-04-10T16:00:00Z',
  },
  {
    id: 'mock-10',
    problem_id: 143,
    title: 'Reorder List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers', 'Stack'],
    proficiency: '理解',
    solutions: [],
    created_at: '2026-04-20T11:00:00Z',
    updated_at: '2026-04-20T11:00:00Z',
  },
  {
    id: 'mock-11',
    problem_id: 33,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    proficiency: '生疏',
    solutions: [],
    created_at: '2026-04-25T09:00:00Z',
    updated_at: '2026-04-25T09:00:00Z',
  },
  {
    id: 'mock-12',
    problem_id: 23,
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Heap', 'Divide and Conquer'],
    proficiency: '生疏',
    solutions: [],
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-01T10:00:00Z',
  },
];
