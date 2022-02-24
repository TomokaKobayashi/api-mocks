import { ElementVNode, h, text } from 'hyperapp';

export type TreeNode = {
  name: string;
  value?: string | number | boolean | null | undefined | any[];
  expanded?: boolean;
  children?: TreeNode[];
};

export const TreeBranch = (node: TreeNode, level=0): ElementVNode<unknown> => {
  const children:ElementVNode<unknown>[] = [];
  let icon = (node.children && node.children.length>0 && node.expanded) ? 'expand_less' : (node.children && node.children.length>0) ? 'expand_more' : '';
  children.push(h('li', {}, [
    h('span', {class:'icon'}, [h('span', {class: 'material-icons'}, text(icon))]),
    h('span', {}, text('test')),
  ]));
  if(node.children && node.children.length>0 && node.expanded){
    node.children.forEach((value)=>{
      children.push(h('li', {}, TreeBranch(value, level+1)));
    });
  }
  return h('div', {class: 'block', style: {flexDirection: 'column'}}, h('ul', {}, children));
};

export const TestNode = (node: TreeNode) => {
  return h('ul', {}, [
    h('span', {class:'icon'}, [h('span', {class: 'material-icons'}, text('expand_more'))]),
    h('span', {}, text('test')),
  ])
};