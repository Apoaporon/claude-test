export interface NavItem {
  title: string
  slug: string
  children?: NavItem[]
}

export interface NavCategory {
  title: string
  icon: string
  description: string
  items: NavItem[]
}

export interface HeadingItem {
  id: string
  text: string
  level: number
}
