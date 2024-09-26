import { describe, expect, it } from 'vitest'
import { cascadeDownStyles, createStyleTree, insertToTree, insertToTreeWithCascadeDown, mergeTree } from '..'

describe('createStyleTree', () => {
  it('create default style tree', () => {
    expect(createStyleTree()).toMatchSnapshot()
  })

  it('create named style tree', () => {
    expect(createStyleTree('article')).toMatchSnapshot()
  })
})

describe('insertToTree', () => {
  it('insert block style', () => {
    const tree = createStyleTree()

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: '#fff' })
    expect(actual).toMatchSnapshot()
  })

  it("don't clear exist style", () => {
    const base = createStyleTree()
    const tree = insertToTree(base, ['b-my-block'], { backgroundColor: '#fff' })

    const actual = insertToTree(tree, ['b-my-block'], {})
    expect(actual).toMatchSnapshot()
  })

  it('keep undefined style un-touch', () => {
    const tree = createStyleTree()

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: '#fff' })
    expect(actual.children['b-my-block'].styles.backgroundColor).not.toHaveProperty('md')
    expect(actual.children['b-my-block'].styles.backgroundColor).not.toHaveProperty('lg')
  })

  it('keep null style un-touch', () => {
    const tree = createStyleTree()
    tree.children['b-my-block'] = {
      name: 'b-my-block',
      styles: { backgroundColor: { xs: null } },
      children: {},
    }

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: '#fff' })
    expect(actual.children['b-my-block'].styles.backgroundColor.xs).toBeNull()
    expect(actual.children['b-my-block'].styles.backgroundColor).not.toHaveProperty('md')
    expect(actual.children['b-my-block'].styles.backgroundColor).not.toHaveProperty('lg')
  })

  it('insert block and article style', () => {
    let tree = createStyleTree()
    tree = insertToTree(tree, ['b-my-block'], { backgroundColor: '#fff' })

    expect(insertToTree(tree, ['article', 'article-content', '& h1'], { fontSize: 24 })).toMatchSnapshot()
  })

  it('keep old style', () => {
    const tree = createStyleTree()
    tree.children['b-my-block'] = createStyleTree('b-my-block')
    tree.children['b-my-block'].styles = { backgroundColor: { xs: '#fff' } }

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: '#fff' }, 'md')
    const { styles } = actual.children['b-my-block']
    expect(styles.backgroundColor.md).toBe('#fff')
    expect(styles.backgroundColor.xs).toBe('#fff')
  })

  it('only allow insert null at first', () => {
    const tree = createStyleTree()

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: null }, 'xs')
    expect(actual.children['b-my-block'].styles.backgroundColor.xs).toBeNull()
  })

  it('not allow change a value to null', () => {
    const tree = insertToTree(createStyleTree(), ['b-my-block'], { backgroundColor: '#fff' }, 'xs')

    const actual = insertToTree(tree, ['b-my-block'], { backgroundColor: null }, 'xs')
    expect(actual.children['b-my-block'].styles.backgroundColor.xs).not.toBeNull()
  })
})

describe('mergeTree', () => {
  it('merge two style tree but base is using fragment as root', () => {
    // fragment
    const base = createStyleTree()
    base.children.article = createStyleTree('article')
    base.children.article.styles = { backgroundColor: { xs: '#fff' } }

    const tree = createStyleTree('article')
    tree.styles = { backgroundColor: { xs: '#aaa' } }

    expect(mergeTree(base, tree)).toMatchSnapshot()
  })
})

describe('cascadeDownStyles', () => {
  it('cascade down styles', () => {
    const res1 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
      breakpoint: 'lg',
    })

    expect(res1.styles.backgroundColor.lg).toBe('#fff')
    expect(res1.styles.backgroundColor.md).toBe('#fff')
    expect(res1.styles.backgroundColor.xs).toBe('#fff')
    expect(res1.meta.dirty.backgroundColor).toBe('lg')

    const res2 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
      breakpoint: 'md',
    })

    expect(res2.styles.backgroundColor.lg).toBeUndefined()
    expect(res2.styles.backgroundColor.md).toBe('#fff')
    expect(res2.styles.backgroundColor.xs).toBe('#fff')
    expect(res2.meta.dirty.backgroundColor).toBe('md')

    const res3 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
    })

    expect(res3.styles.backgroundColor.lg).toBeUndefined()
    expect(res3.styles.backgroundColor.md).toBeUndefined()
    expect(res3.styles.backgroundColor.xs).toBe('#fff')
    expect(res3.meta.dirty.backgroundColor).toBe('xs')
  })

  it('skip cascade down if lower breakpoint is dirty', () => {
    const res1 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
      breakpoint: 'lg',
      meta: { dirty: { backgroundColor: 'md' } },
    })

    expect(res1.styles.backgroundColor.lg).toBe('#fff')
    expect(res1.styles.backgroundColor.md).toBeUndefined()
    expect(res1.styles.backgroundColor.xs).toBeUndefined()
    expect(res1.meta.dirty.backgroundColor).toBe('md')

    const res2 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
      breakpoint: 'lg',
      meta: { dirty: { backgroundColor: 'xs' } },
    })

    expect(res2.styles.backgroundColor.lg).toBe('#fff')
    expect(res2.styles.backgroundColor.md).toBeUndefined()
    expect(res2.styles.backgroundColor.xs).toBeUndefined()
    expect(res2.meta.dirty.backgroundColor).toBe('xs')

    const res3 = cascadeDownStyles({
      raw: { backgroundColor: '#fff' },
      breakpoint: 'md',
      meta: { dirty: { backgroundColor: 'xs' } },
    })

    expect(res3.styles.backgroundColor.lg).toBeUndefined()
    expect(res3.styles.backgroundColor.md).toBe('#fff')
    expect(res3.styles.backgroundColor.xs).toBeUndefined()
    expect(res3.meta.dirty.backgroundColor).toBe('xs')
  })
})

describe('insertToTreeWithCascadeDown', () => {
  it('insert block style with cascade down', () => {
    const tree = createStyleTree()

    const actual = insertToTreeWithCascadeDown(tree, ['b-my-block'], { backgroundColor: '#fff' }, 'lg')
    expect(actual).toMatchSnapshot()
  })

  it('keep null style un-touch when cascading down', () => {
    const tree = createStyleTree()
    tree.children['b-my-block'] = {
      name: 'b-my-block',
      styles: { backgroundColor: { md: null } as any },
      children: {},
    }

    const actual = insertToTreeWithCascadeDown(tree, ['b-my-block'], { backgroundColor: '#fff' }, 'lg')
    expect(actual.children['b-my-block'].styles.backgroundColor.md).toBeNull()
    expect(actual.children['b-my-block'].styles.backgroundColor.xs).toBe('#fff')
    expect(actual.children['b-my-block'].styles.backgroundColor.lg).toBe('#fff')
  })
})
