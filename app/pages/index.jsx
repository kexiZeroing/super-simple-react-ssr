
import React, { useState } from 'react';

export const HomePage = ({ title, posts }) => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Home Page</h1>
      <h3>{title}</h3>

      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>

      {posts.map(post => (
        <div key={post.id}>
          <h4>{post.id}.{post.title}</h4>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  );
}

// mimic Next.js `getServerSideProps`
export const notNextServerSideProps = async (fetch) => {
  const data = await fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(json => json);

  return {
    props: {
      title: 'All Posts',
      posts: data
    }
  }
}