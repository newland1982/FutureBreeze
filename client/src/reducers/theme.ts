const themeReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'ADD_BOOK':
      return [
        ...state,
        {
          title: action.book.title,
          author: action.book.author,
        }
      ];
    case 'REMOVE_BOOK':
      return;
    default:
      return state;
  }
};

export default themeReducer;
