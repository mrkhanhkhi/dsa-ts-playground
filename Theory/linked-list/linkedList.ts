import { assertEqual } from "../../utils/assert";

export class ListNode<T> {
  constructor(public val: T, public next: ListNode<T> | null = null) {}
}
export class LinkedList<T> {
  head: ListNode<T> | null = null;
  pushBack(val: T){ const n=new ListNode(val); if(!this.head){this.head=n; return;} let c=this.head; while(c.next) c=c.next; c.next=n; }
  pushFront(val: T){ this.head = new ListNode(val, this.head); }
  toArray(): T[]{ const res: T[]=[]; let c=this.head; while(c){res.push(c.val); c=c.next;} return res; }
}

if (require.main === module) {
  const ll = new LinkedList<number>();
  [1,2,3].forEach(v => ll.pushBack(v));
  ll.pushFront(0);
  assertEqual(ll.toArray(), [0,1,2,3], "linked list basic");
}
