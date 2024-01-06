//kinda classes
function LINK(/*int*/ count=0,  /*int*/ depth=0){
  return {count,depth,next:[null,null]};
}
function BINARY(/*int*/ length,  /*bool*/ arr){
  return {length,arr};
}

//functions
function binary(/*int*/ num){ //BINARY
  if(num===0) return BINARY(1,[0]);
  let length=Math.floor(Math.log2( num )+1), i=length-1; //integers
  let arr=Array(length); //boolean array
  while(num!==0){
    arr[i--]=num%2;
    num=Math.floor(num/2);
  }
  return BINARY(length,arr);
}

function addTo(/*LINK*/ list,  /*BINARY*/ item){ //LINK
  let num=binary(item.elo)
  let temp=list, returnList=list; //LINKs
  let i=0, count=temp.count; //integers
  if(num.length>list.depth) returnList=LINK(count,num.length);
  
  list=returnList;
  if(temp.count===0){ //thus, temp.depth is 0
    for(i=0;i<num.length;i++){
      list.next[ num.arr[i] ]=LINK(count,num.length-(i+1));
      list=list.next[ num.arr[i] ];
    }
  }
  else{
    for(i=0;i<num.length-temp.depth;i++){
      list.next[ 0 ]=LINK(count,num.length-(i+1));
      list=list.next[ 0 ];
    }
  }
  list.next=temp.next;
  returnList.count++;
  temp=returnList;
  
  for(i=0;i<returnList.depth-num.length;i++){
    if(temp.next[ 0 ]===null) temp.next[ 0 ]=LINK(1,returnList.depth-(i+1));
    else temp.next[0].count++;
    temp=temp.next[0];
  }
  for(i=0;i<num.length;i++){
    if(temp.next[ num.arr[i] ]===null)
      temp.next[ num.arr[i] ]=LINK(1,num.length-(i+1));
    else
      temp.next[ num.arr[i] ].count++;
    temp=temp.next[ num.arr[i] ];
  }
  if(!temp.entries) temp.entries=[];
  temp.entries.push(item) //I trust my code that calls it to not create duplicate values here
  //why do I trust this? because the computation of a full search is needed otherwise
  //why not a map? I'm already spamming memory ;-;
  return returnList;
}
function takeAway(/*LINK*/ list,  /*BINARY*/ item){ //LINK
  let num=binary(item.elo)
  if(num.length>list.depth || list.depth===0) return list;
  let PATH=Array(list.depth), n; //bool
  let i, depth=list.depth, diff=depth-num.length; //integers
  let temp=list, returnList=list, number=Array(depth+1); //LINKs
  for(i=0;i<depth;i++){
    //diff is the list's depth (depth of its highest number) minus the depth of the number itself
    //where "depth" is the amount of bits to express a number in binary
    //thus, n encompasses the trailing 0s before the number starts based on the depth of the list
    if(i<diff) n=0;
    else n=num.arr[i-diff];
    if(temp.next[n]===null) return returnList;
    PATH[depth-1-i]=n;
    temp=temp.next[n];
    number[depth-1-i]=temp;
  }
  
  let index=number[0].entries.indexOf(item)
  if(index===-1) return returnList;
  number[depth]=returnList;
  number[0].count--;
  number[0].entries.splice(index,1);
  for(i=0;i<depth;i++){
    number[i+1].count--;
    if(number[i].count===0){
      number[i+1].next[ PATH[i] ]=null;
      //free(number[i]);
    }
  }
  while(returnList.next[1]===null && returnList.next[0]!==null){
    //temp=returnList;
    returnList=returnList.next[0];
    //free(temp);
  }
  if(returnList.count===0) returnList.depth=0;
  return returnList;
}

function equalTo(/*LINK*/ list,  /*BINARY*/ item){ //int
  let num=binary(item.elo)
  if(num.length>list.depth || list.count===0) return 0;
  let temp=list; //LINK
  let i; //integer
  for(i=0;i<list.depth-num.length;i++){
    if(temp.next[0]===null) return 0;
    temp=temp.next[ 0 ];
  }
  for(i=0;i<num.length;i++){
    if(temp.next[ num.arr[i] ]===null) return 0;
    temp=temp.next[ num.arr[i] ];
  }
  return temp.count;
}
function lessThan(/*LINK*/ list,  /*BINARY*/ item){ //int
  let num=binary(item.elo)
  let temp=list; //LINK
  let i, count=0; //integers
  if(num.length>list.depth) return list.count;
  for(i=0;i<list.depth-num.length;i++){
    if(temp.next[0]===null) return count;
    temp=temp.next[0];
  }
  for(i=0;i<num.length;i++){
    if(num.arr[i] && temp.next[0]!==null)
      count+=temp.next[0].count;
    if(temp.next[ num.arr[i] ]===null) return count;
    temp=temp.next[ num.arr[i] ];
  }
  return count;
}
function moreThan(/*LINK*/ list,  /*BINARY*/ item){ //int
  let num=binary(item.elo)
  let temp=list; //LINK
  let i, count=0; //integers
  if(num.length>list.depth) return count;
  for(i=0;i<list.depth-num.length;i++){
    if(temp.next[1]!==null) count+=temp.next[1].count;
    if(temp.next[0]===null) return count;
    temp=temp.next[0];
  }
  for(i=0;i<num.length;i++){
    if(!num.arr[i] && temp.next[1]!==null)
      count+=temp.next[1].count;
    if(temp.next[ num.arr[i] ]===null) return count;
    temp=temp.next[ num.arr[i] ];
  }
  return count;
}
function atIndex(/*LINK*/ list,  /*int*/ num){
  if(num>=list.count)
    throw new RangeError("This index doesn't exist in the list");
  let arr=Array(list.depth), n, full; //bools
  let myNumber=BINARY(list.depth,arr); //BINARY
  let temp=list; //LINK
  let index=0; //int
  //index is amount of locations in the list exceeded due to implied logic with the count attribute
  while(temp.depth>0){
    full=temp.next[0]!==null && temp.next[1]!=null;
    if(!full) n=(temp.next[0]===null)-0;
    else n=(index+temp.next[0].count<=num)-0;
    if(n&&full) index+=temp.next[0].count;
    arr[list.depth-temp.depth]=n;
    temp=temp.next[n];
  }
  return temp.entries;
  return integer(myNumber);
}
function indexAt(/*LINK*/ list,  /*BINARY*/ item){
  let num=binary(item.elo)
  if(num.length>list.depth || list.count===0) return -1;
  let temp=list; //LINK
  let i, index=0; //integer
  for(i=0;i<list.depth-num.length;i++){
    if(temp.next[0]===null) return -1;
    temp=temp.next[ 0 ];
  }
  for(i=0;i<num.length;i++){
    if(temp.next[ num.arr[i] ]===null) return -1;
    if(num.arr[i] && temp.next[0]) index+=temp.next[0].count;
    temp=temp.next[ num.arr[i] ];
  }
  return index; //true value of the exact object is index+temp.entries.indexOf(item) however we discriminate only on elo value here
}

function integer(/*BINARY*/ num){ //int
  let p, j, i, n=0; //integers
  for(i=num.length-1;i>=0;i--){
    p=1; //power
    for(j=num.length-1;j>i;j--) p*=2;
    n+=p*num.arr[i];
  }
  return n;
}
function ascending(/*LINK*/ list){ //void
  let i, result, intPtr=0, length=list.count; //integers
  let arr=Array(list.depth), n; //bools
  let num=BINARY(list.depth,arr); //binary
  let linkPtrs=Array(list.depth), temp=list; //LINKs
  for(i=0;i<list.depth;i++) arr[i]=0;
  while(length>0){
    if(length<list.count) temp=linkPtrs[intPtr];
    for(i=intPtr;i<list.depth;i++){
      n=num.arr[i]; //1 or 0
      if(temp.next[0]!==null && temp.next[1]!==null) intPtr=i;
      if(temp.next[n]===null) n=!n-0;
      linkPtrs[i]=temp;
      temp=temp.next[n];
      num.arr[i]=n;
    }
    //result=integer(num);
    for(i=0;i<temp.count;i++){
      length--;
      console.log(temp.entries[i]); //instead of result
    }
    while(intPtr>=0&&  (!(linkPtrs[intPtr].next[0]===null || linkPtrs[intPtr].next[1]===null)? num.arr[intPtr]: true))
      intPtr--; //keep going back up until another crossroad when all numbers from crossroad evaluated
    if(!num.arr[intPtr]) num.arr[intPtr]++;
    for(i=intPtr+1;i<list.depth;i++) num.arr[i]=0;
  }
}
function descending(/*LINK*/ list){ //void
  let i, result, intPtr=0, length=list.count; //integers
  let arr=Array(list.depth), n; //bools
  let num=BINARY(list.depth,arr); //binary
  let linkPtrs=Array(list.depth), temp=list; //LINKs
  for(i=0;i<list.depth;i++) arr[i]=1;
  while(length>0){
    if(length<list.count) temp=linkPtrs[intPtr];
    for(i=intPtr;i<list.depth;i++){
      n=num.arr[i]; //1 or 0
      if(temp.next[0]!==null && temp.next[1]!==null) intPtr=i;
      if(temp.next[n]===null) n=!n-0;
      linkPtrs[i]=temp;
      temp=temp.next[n];
      num.arr[i]=n;
    }
    //result=integer(num);
    for(i=0;i<temp.count;i++){
      length--;
      console.log(temp.entries[i]); //instead of result
    }
    while(intPtr>=0&&  (!(linkPtrs[intPtr].next[0]===null || linkPtrs[intPtr].next[1]===null)? !num.arr[intPtr]: true))
      intPtr--; //keep going back up until another crossroad when all numbers from crossroad evaluated
    if(num.arr[intPtr]) num.arr[intPtr]--;
    for(i=intPtr+1;i<list.depth;i++) num.arr[i]=1;
  }
}

module.exports={LINK,BINARY,binary,integer,ascending,descending,addTo,takeAway,equalTo,lessThan,moreThan,atIndex,indexAt}
/*//testing
let list=LINK(); //instance
let arr=[24,25,33,0,33,1].map(function(o){return {elo:o}}), item=arr[4];

//use of addTo
for(let part of arr)
  list=addTo(list,part);

//interactions of atIndex and indexAt
console.log(atIndex(list,2))
console.log(indexAt(list,item))
console.log(indexAt(list,atIndex(list,2)[0]))
console.log(atIndex(list,indexAt(list,item))[0])

//delete testing
ascending(list)
list=takeAway(list,item)
ascending(list)
list=takeAway(list,item)
ascending(list)*/