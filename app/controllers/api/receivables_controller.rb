class Api::ReceivablesController < Api::BaseApiController
  
  def index
    
    if params[:livesearch].present? 
      livesearch = "%#{params[:livesearch]}%"
    @objects = Receivable.where{ 
        (
          (source_code =~  livesearch )          
        )
        
      }.page(params[:page]).per(params[:limit]).order("id DESC")
      
      @total = Receivable.where{
        (
          (source_code =~  livesearch )   
        )
        
      }.count
    else
      @objects = Receivable.active_objects.page(params[:page]).per(params[:limit]).order("id DESC")
      @total = Receivable.active_objects.count
    end
    
    
    
     render :json => { :receivables => @objects , :total => @total, :success => true }
  end

  def create
    @object = Receivable.create_object( params[:receivable] )  
    
    
 
    if @object.errors.size == 0 
      render :json => { :success => true, 
                        :receivables => [@object] , 
                        :total => Receivable.active_objects.count }  
    else
      msg = {
        :success => false, 
        :message => {
          :errors => extjs_error_format( @object.errors )  
        }
      }
      
      render :json => msg                         
    end
  end

  def update
    @object = Receivable.find_by_id params[:id] 
    if params[:confirm].present?
      if not current_user.has_role?( :receivables, :confirm)
          render :json => {:success => false, :access_denied => "Tidak punya authorisasi"}
          return
        end
      @object.confirm_object(params[:receivable]) 
      
      elsif params[:unconfirm].present?
        if not current_user.has_role?( :receivables, :unconfirm)
          render :json => {:success => false, :access_denied => "Tidak punya authorisasi"}
          return
        end
      @object.unconfirm_object
      
    else
      @object.update_object( params[:receivable])
    end
    if @object.errors.size == 0 
      render :json => { :success => true,   
                        :receivables => [@object],
                        :total => Receivable.active_objects.count  } 
    else
      msg = {
        :success => false, 
        :message => {
          :errors => extjs_error_format( @object.errors )  
        }
      }
      
      render :json => msg 
    end
  end

  def destroy
    @object = Receivable.find(params[:id])
    @object.delete_object

    if not @object.is_deleted?
      msg = {
        :success => false, 
        :message => {
          :errors => extjs_error_format( @object.errors )  
        }
      }
      
      
      render :json => msg
    else
      
      
      render :json => { :success => true, :total => Receivable.active_objects.count }  
    end
  end
  
  def search
    search_params = params[:query]
    selected_id = params[:selected_id]
    if params[:selected_id].nil?  or params[:selected_id].length == 0 
      selected_id = nil
    end
    
    query = "%#{search_params}%"
    # on PostGre SQL, it is ignoring lower case or upper case 
    
    if  selected_id.nil?
      @objects = Receivable.active_objects.where{
                                (
                                  
                                  (source_code =~  query )
                                  
                                )
                              }.
                        page(params[:page]).
                        per(params[:limit]).
                        order("id DESC")
                        
      @total = Receivable.active_objects.where{ 
                                (
                                   (source_code =~  query )
                                )
                              }.count
    else
      @objects = Receivable.where{ (id.eq selected_id)  
                              }.
                        page(params[:page]).
                        per(params[:limit]).
                        order("id DESC")
   
      @total = Receivable.where{ (id.eq selected_id)   
                              }.count 
    end
    
    
    render :json => { :records => @objects , :total => @total, :success => true }
  end
end
