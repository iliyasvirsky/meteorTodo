import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});

Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    var sortValue = Session.get('sort') || 1;

    console.log('called it on change', sortValue);
    switch (sortValue) {
      case 'name':
        if (instance.state.get('hideCompleted')) {
          // If hide completed is checked, filter tasks
          return Tasks.find({ checked: { $ne: true } }, { sort: { name: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { name: -1 } });
        break;
      case 'date':
        if (instance.state.get('hideCompleted')) {
          // If hide completed is checked, filter tasks
          return Tasks.find({ checked: { $ne: true } }, { sort: { date: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { date: -1 } });
        break;
      case 'number':
        if (instance.state.get('hideCompleted')) {
          // If hide completed is checked, filter tasks
          return Tasks.find({ checked: { $ne: true } }, { sort: { number: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { number: -1 } });
        break;
      default: {
        if (instance.state.get('hideCompleted')) {
          // If hide completed is checked, filter tasks
          return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { createdAt: -1 } });
      }
        
    }

  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  },
});

Template.body.events({
  'change .sort'(event) {
    console.log(event.target.value);  
    var sortBy = event.target.value; 
    Session.set('sort', sortBy);

  },
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;
    const number = target.number.value;
    const date = target.date.value;
    let error = false;
    console.log('text', text, 'number', number, 'date', date);
    
    if (text.length < 5) {
      error = true;
      Meteor.call('tasks.error', 'the task needs to be at least 5 letters');
      alert('The task name to be at least 5 letters');
    } 
    if (number > 5 || number < 1) {
      error = true;
      Meteor.call('tasks.error', 'priority needs to be between 1 and 5');
      alert('Priority needs to be between 1 and 5');
    }
    if (date.length < 1) {
      error = true;
      Meteor.call('tasks.error', 'date needs entered ');
      alert('Please enter a date');
    }
    if(!error) {
      
      // Insert a task into the collection
      Meteor.call('tasks.insert', text, number, date);
      // Clear form
      target.text.value = '';
      target.number.value = '';
      target.date.value = '';
    }

  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});