import type { NavCategory } from '../types/doc'

export const navigation: NavCategory[] = [
  {
    title: 'はじめに',
    icon: '🚀',
    description: 'Claude Codeのインストールから最初のステップまで',
    items: [
      { title: 'インストール', slug: 'getting-started/installation' },
      { title: '最初のステップ', slug: 'getting-started/first-steps' },
      { title: '設定', slug: 'getting-started/configuration' },
    ],
  },
  {
    title: '機能',
    icon: '⚡',
    description: 'スラッシュコマンド、スキル、MCPツールなど主要機能の解説',
    items: [
      { title: 'スラッシュコマンド', slug: 'features/slash-commands' },
      { title: 'スキル', slug: 'features/skills' },
      { title: 'プラグイン', slug: 'features/plugins' },
      { title: 'MCPツール', slug: 'features/mcp-tools' },
      { title: 'プランモード', slug: 'features/plan-mode' },
    ],
  },
  {
    title: 'ベストプラクティス',
    icon: '✨',
    description: '効果的なプロンプト設計とワークフローの最適化',
    items: [
      { title: 'プロンプトエンジニアリング', slug: 'best-practices/prompt-engineering' },
      { title: 'プロジェクトセットアップ', slug: 'best-practices/project-setup' },
      { title: 'ワークフロー', slug: 'best-practices/workflows' },
    ],
  },
  {
    title: 'リファレンス',
    icon: '📖',
    description: 'キーボードショートカット、CLIオプション、パーミッション設定',
    items: [
      { title: 'キーボードショートカット', slug: 'reference/keyboard-shortcuts' },
      { title: 'CLIオプション', slug: 'reference/cli-options' },
      { title: 'パーミッション', slug: 'reference/permissions' },
    ],
  },
]
