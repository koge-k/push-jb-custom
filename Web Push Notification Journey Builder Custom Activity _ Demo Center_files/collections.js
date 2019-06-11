(function ($) {
  const successIcon = `
      <div class="slds-align_absolute-center">
        <span class="slds-icon_container slds-icon-standard-task-2">
          <svg aria-hidden="true" class="slds-icon slds-icon_large">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#task2"></use>
          </svg>
        </span>
      </div>
    `;
  const spinner = `
    <div class="slds-align_absolute-center slds-p-vertical_x-large slds-is-relative">
      <div role="status" class="slds-spinner slds-spinner_medium slds-spinner_brand">
        <span class="slds-assistive-text">Loading</span>
        <div class="slds-spinner__dot-a"></div>
        <div class="slds-spinner__dot-b"></div>
      </div>
    </div>
  `;

  // ADD TO COLLECTION
  $(document).on('click', '.js--collect', function (e) {
    $('#collections-modal-bkgnd').removeClass('slds-hide');
    $('#collections-modal-add').removeClass('slds-hide');
    $('.js--done-col-add').prop('disabled', true);

    const itemID = $(this).data('itemid');
    const collectable = $(this).data('collectable');

    // set create new collection fields incase needed
    $('input[name=collectable]').val(collectable);
    $('input[name=itemID]').val(itemID);
    // grab user's collections
    $.ajax({
      type: 'GET',
      url: '/collections/view/my-collections',
      dataType: 'json',
      timeout: 4000,
      global: false,
      success (response) {
        // loop and append to div #collections-modal-add-list
        if (!response.length) {
          $('#collections-modal-add-list').append('Looks like you haven\'t created a collection yet!');
        } else {
          response.forEach((collection, index) => {
            let item = '';
            let locked = '';

            if (!collection.public) {
              locked = `
                <span class="slds-icon_container slds-float_left slds-m-left_small">
                  <svg aria-hidden="true" class="slds-icon slds-icon-text-default slds-icon_x-small">
                    <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#lock"></use>
                  </svg>
                </span>
              `;
            }

            item = `
              <span class="slds-button slds-radio_button modal__add-to-collection--collection js--select-col" data-itemID="${itemID}" data-collectable="${collectable}" data-collection="${collection.id}">
                <input name="radio" type="radio" id="collection${index}" />
                <label class="slds-radio_button__label" for="collection${index}">
                  <span class="slds-radio_faux slds-p-vertical_medium">
                    <div class="slds-clearfix">
                      <div class="slds-text-heading_small slds-p-right_xx-small slds-float_left">
                        ${collection.name}
                      </div>
                      ${locked}
                    </div>
                    <p class="modal__add-to-collection--posts has-salesforce-grey-text">${collection.contentLength} items</p>
                  </span>
                </label>
              </span>
              `;

            $('#collections-modal-add-list').append(item);
          });
        }
      }
    });
  });

  // SELECT COLLECTION
  $('#collections-modal-add-list').on('click', 'span.js--select-col', function () {
    $('.js--done-col-add').prop('disabled', false);
    $('#col-selector').attr('data-collectable', $(this).attr('data-collectable'));
    $('#col-selector').attr('data-itemID', $(this).attr('data-itemID'));
    $('#col-selector').attr('data-collection', $(this).attr('data-collection'));
  });
  // CLOSE - close add to collection modal
  $('.js--close-col-add').click(() => {
    $('#collections-modal-add-list').empty();
    $('#collections-modal-add, #collections-modal-bkgnd').addClass('slds-hide');
  });
  // DONE - add to collection
  $('.js--done-col-add').click(function () {
    $('#collections-modal-add-list').empty();
    $('.js--done-col-add,.js--close-col-add,.js--new-collection').prop('disabled', true);
    // add loader
    $('#collections-modal-add-list').append(spinner);
    // grab data attributes

    $.ajax({
      type: 'POST',
      url: '/collections/add',
      data: {
        collectableId: $(this).data('itemid'),
        collectable: $(this).data('collectable'),
        collectionId: $(this).data('collection')
      },
      dataType: 'json',
      timeout: 4000,
      global: false,
      beforeSend: (xhr) => {
        xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));
      },
      statusCode: {
        200 () {
          setTimeout(() => {
            $('#collections-modal-add-list').empty();
            $('#collections-modal-add-list').append(successIcon);
            setTimeout(() => {
              $('#collections-modal-add,#collections-modal-bkgnd').addClass('slds-hide');
              $('.js--done-col-add,.js--close-col-add,.js--new-collection').removeAttr('disabled');
              $('#collections-modal-add-list').empty();
            }, 1500);
          }, 1000);
        },
        500 () {
          $('#collections-modal-add-list').empty();
          $('.js--done-col-add,.js--close-col-add,.js--new-collection').removeAttr('disabled');
        }
      },
      success () {
        setTimeout(() => {
          $('#collections-modal-add-list').empty();
          $('#collections-modal-add-list').append(successIcon);
          setTimeout(() => {
            $('#collections-modal-add,#collections-modal-bkgnd').addClass('slds-hide');
            $('.js--done-col-add,.js--close-col-add,.js--new-collection').removeAttr('disabled');
            $('#collections-modal-add-list').empty();
          }, 1500);
        }, 1000);
      }
    });
  });
  // CREATE NEW COLLECTION
  $('.js--new-collection').click(() => {
    $('#collections-modal-add').addClass('slds-hide');
    $('#collections-modal-create').removeClass('slds-hide');
    $('.js--close-col-create,.js--create-col').prop('disabled', false);
    $('#errorMessage').remove();
  });

  // CREATE AND ADD TO LIST
  $('.js--create-col').click(() => {
    $('.js--close-col-create,.js--create-col').prop('disabled', true);
    $('#js--create-col-form').hide();
    $('#errorMessage').remove();
    $('.js--create-col-form-wrapper').append(spinner);

    const title = $('#createCollection_form input[name=collectionTitle]').val();
    const description = $('#createCollection_form input[name=collectionDescription]').val();

    if (!title || title === '' || !description || description === '') {
      const errorMessage = `
        <div id="errorMessage">
          <span class="slds-icon_container slds-icon-standard-reward slds-float_left">
            <svg aria-hidden="true" class="slds-icon">
              <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#unmatched"></use>
            </svg>
          </span>
          <p class="slds-float_left slds-p-top_x-small slds-p-left_x-small" >You must fill out a title and description.</p>
        </div>
        `;
      $('#spinner').remove();
      $('#js--create-col-form').show();
      $('.js--close-col-create,.js--create-col').prop('disabled', false);
      $('.js--create-col-form-wrapper').append(errorMessage);
    } else {
      $.ajax({
        type: 'POST',
        url: '/collections/create',
        data: {
          name: title,
          description,
          isPublic: $('#collectionisPublic :selected').val()
        },
        dataType: 'json',
        global: false,
        timeout: 4000,
        beforeSend: (xhr) => {
          xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));
        },
        statusCode: {
          500 () {
            const errorMessage = `
              <div id="errorMessage">
                <span class="slds-icon_container slds-icon-standard-reward slds-float_left">
                  <svg aria-hidden="true" class="slds-icon">
                    <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#unmatched"></use>
                  </svg>
                </span>
                <p class="slds-float_left slds-p-top_x-small slds-p-left_x-small">Please check title and description for illegal characters.</p>
              </div>
            `;
            $('#spinner').remove();
            $('#js--create-col-form').show();
            $('.js--close-col-create,.js--create-col').prop('disabled', false);
            $('.js--create-col-form-wrapper').append(errorMessage);
          }
        },
        success (response) {
          // clear out form - clear out error message
          const successMessage = `
              <div class="slds-align_absolute-center" id="successMessage">
                <span class="slds-icon_container slds-icon-standard-task-2 slds-float_left">
                  <svg aria-hidden="true" class="slds-icon">
                    <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#task2"></use>
                  </svg>
                </span>
                <p class="slds-float_left slds-p-top_x-small slds-p-left_x-small">Collection created.</p>
              </div>
            `;
          $('#spinner,#errorMessage').remove();
          $('#collections-modal-add-list').empty();
          $('.js--create-col-form-wrapper').append(successMessage);
          setTimeout(() => {
            const itemID = $('#createCollection_form input[name=itemID]').val();
            const collectable = $('#createCollection_form input[name=collectable]').val();

            let item = '';
            let locked = '';

            if (!response.isPublic) {
              locked = `
                <span class="slds-icon_container slds-float_left slds-m-left_small">
                  <svg aria-hidden="true" class="slds-icon slds-icon-text-default slds-icon_x-small">
                  <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#lock"></use>
                  </svg>
                </span>
              `;
            }

            item += `
              <span class="slds-button slds-radio_button modal__add-to-collection--collection js--select-col" data-itemID="${itemID}" data-collectable="${collectable}" data-collection="${response.id}">
                <input name="radio" type="radio" id="collection${response.id}" />
                <label class="slds-radio_button__label" for="collection${response.id}">
                  <span class="slds-radio_faux slds-p-vertical_medium">
                    <div class="slds-clearfix">
                      <div class="slds-text-heading_small slds-p-right_xx-small slds-float_left">
                        ${response.title}
                      </div>
                      ${locked}
                    </div>
                    <p class="modal__add-to-collection--posts has-salesforce-grey-text">0 items</p>
                  </span>
                </label>
              </span>
              `;

            $('#collections-modal-add-list').prepend(item);

            $('input[name=collectable]').val('');
            $('input[name=itemID]').val('');
            $('#createCollection_form input[name=collectionTitle]').val('');
            $('#createCollection_form input[name=collectionDescription]').val('');
            $('#collections-modal-create').addClass('slds-hide');
            $('#js--create-col-form').show();
            $('#successMessage').remove();
            $('#collections-modal-add').removeClass('slds-hide');
          }, 1500);
        }
      });
    }// end else
  });
  // CLOSE & CANCEL CREATE NEW COLLECTION
  $('.js--close-col-create').click(() => {
    $('#collections-modal-create').addClass('slds-hide');
    $('#collections-modal-add').removeClass('slds-hide');
  });
  $('.js--col-show-followers').css('cursor', 'pointer');
  // CLOSE SHOW FOLLOWERS
  $('.js--col-close-followers').click(() => {
    $('#collections-modal-bkgnd,.js--col-followers').addClass('slds-hide');
  });
  // SHOW followers
  $('.js--col-show-followers').click(function () {
    $('#collections-modal-followers').empty();
    $('#collections-modal-bkgnd,.js--col-followers').removeClass('slds-hide');
    const collectionID = $(this).attr('data-collectionID');

    $.ajax({
      type: 'GET',
      url: `/collections/view-followers/${collectionID}`,
      dataType: 'json',
      global: false,
      timeout: 4000,
      success (response) {
        response.forEach((follower) => {
          const item = `
            <div class="hero__inner slds-grid slds-wrap slds-grid_vertical-align-center slds-m-left_large slds-m-bottom_medium">
              <img class="img__profile--standard img__profile--standard-overlap slds-m-right_small" src="${follower.thumbnail}" />
            <a href="${follower.url}" class="slds-float_right">${follower.fullName}</a>
            </div>
          `;
          $('#collections-modal-followers').append(item);
        });
      }
    });
  });
  $('.js--col-show-descriptions').click(() => {
    $('.js--col-descriptions').removeClass('slds-hide');
    $('.js--card-simple').matchHeight._update();
  });
}(jQuery));
