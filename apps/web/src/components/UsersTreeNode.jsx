export default function UsersTreeNode({ node }) {
  const kids = (node.descendants || []).filter((d) => String(d.parentId) === String(node._id));
  return (
    <li>
      <div>
        <strong>{node.name}</strong> — {node.email} — <i>{node.role}</i>
      </div>
      {kids.length > 0 && (
        <ul style={{ marginLeft: 20 }}>
          {kids.map((child) => (
            <UsersTreeNode key={child._id} node={{ ...child, descendants: node.descendants }} />
          ))}
        </ul>
      )}
    </li>
  );
}
