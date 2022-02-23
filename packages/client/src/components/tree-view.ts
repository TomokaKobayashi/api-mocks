import { ElementVNode, h, text } from 'hyperapp';

type TreeNode = {
  name: string;
  value: string | number | boolean | null | undefined | any[];
  children: TreeNode[];
};

const TreeBranch = (node: TreeNode, level=0): ElementVNode<unknown> => {
  const children:ElementVNode<unknown>[] = [];
  if(node.children.length>0){

  }
  return h('div', {}, children);
};

export const TestNode = (node: TreeNode) => {
  return h('ul', {}, [
    h('span', {class:'icon'}, [h('span', {class: 'material-icons-outlined'}, text('add_box'))]),
    h('span', {}, text('test')),
  ])
};