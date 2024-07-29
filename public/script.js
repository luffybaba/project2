document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', handleAdminLogin);
    }
    if (document.getElementById('add-item-form')) {
        document.getElementById('add-item-form').addEventListener('submit', handleAddItem);
        loadItemsForAdmin();
    }
    if (document.getElementById('items-list')) {
        loadItemsForUser();
    }
});

function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('admin-actions').style.display = 'block';
        } else {
            alert(data.message);
        }
    });
}

function handleAddItem(event) {
    event.preventDefault();
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;

    fetch('/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
    })
    .then(response => response.json())
    .then(item => {
        addItemToList(item, true);
        document.getElementById('item-name').value = '';
        document.getElementById('item-description').value = '';
    });
}

function loadItemsForAdmin() {
    fetch('/items')
    .then(response => response.json())
    .then(items => {
        items.forEach(item => addItemToList(item, true));
    });
}

function loadItemsForUser() {
    fetch('/user-items')
    .then(response => response.text())
    .then(itemsHTML => {
        document.getElementById('items-list').innerHTML = itemsHTML;
    });
}

function addItemToList(item, isAdmin) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${isAdmin ? `
        <button onclick="deleteItem(${item.id})">Delete</button>
        <button onclick="editItem(${item.id}, '${item.name}', '${item.description}')">Edit</button>
        ` : `
        <div>
            <label for="rating-${item.id}">Rate: </label>
            <select id="rating-${item.id}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            <button onclick="rateItem(${item.id})">Submit Rating</button>
        </div>
        <p>Ratings: ${item.rating.join(', ')}</p>
        `}
    `;
    document.getElementById('items-list').appendChild(itemDiv);
}

function deleteItem(id) {
    fetch(`/items/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    });
}

function editItem(id, name, description) {
    const newName = prompt('Enter new name', name);
    const newDescription = prompt('Enter new description', description);

    fetch(`/items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName, description: newDescription })
    })
    .then(response => response.json())
    .then(item => {
        location.reload();
    });
}

function rateItem(id) {
    const rating = document.getElementById(`rating-${id}`).value;

    fetch(`/items/${id}/rate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
    })
    .then(response => response.json())
    .then(item => {
        location.reload();
    });
}
