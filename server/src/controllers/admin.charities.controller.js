import supabase from "../config/supabase.js";

const BUCKET_NAME = "charities";

const getAdminCharities = async (req, res) => {
  try {
    const { data: charities, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Get admin charities error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch charities.",
      });
    }

    return res.status(200).json({
      success: true,
      charities: charities || [],
    });
  } catch (error) {
    console.error(
      "Admin charities error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADD CHARITY
|--------------------------------------------------------------------------
*/

const createAdminCharity = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      website_url,
      image_url,
      featured,
      active,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Charity name is required.",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Charity description is required.",
      });
    }

    const { data: charity, error } = await supabase
      .from("charities")
      .insert({
        name: name.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        website_url: website_url?.trim() || null,
        image_url: image_url?.trim() || null,
        featured: Boolean(featured),
        active:
          typeof active === "boolean"
            ? active
            : true,
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Create charity error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to create charity.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Charity created successfully.",
      charity,
    });
  } catch (error) {
    console.error(
      "Admin charity create error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE CHARITY
|--------------------------------------------------------------------------
*/

const updateAdminCharity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Charity ID is required.",
      });
    }

    const {
      name,
      description,
      category,
      website_url,
      image_url,
      featured,
      active,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Charity name is required.",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Charity description is required.",
      });
    }

    const { data: charity, error } = await supabase
      .from("charities")
      .update({
        name: name.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        website_url: website_url?.trim() || null,
        image_url: image_url?.trim() || null,
        featured: Boolean(featured),
        active:
          typeof active === "boolean"
            ? active
            : true,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Update charity error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update charity.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Charity updated successfully.",
      charity,
    });
  } catch (error) {
    console.error(
      "Admin charity update error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE CHARITY
|--------------------------------------------------------------------------
*/

const deleteAdminCharity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Charity ID is required.",
      });
    }

    /*
     * First get the charity so we can also remove
     * its image from Storage.
     */
    const { data: charity, error: findError } =
      await supabase
        .from("charities")
        .select("id, image_url")
        .eq("id", id)
        .single();

    if (findError || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found.",
      });
    }

    /*
     * Delete database record.
     */
    const { error: deleteError } =
      await supabase
        .from("charities")
        .delete()
        .eq("id", id);

    if (deleteError) {
      console.error(
        "Delete charity error:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete charity.",
      });
    }

    
    if (charity.image_url) {
      try {
        const marker =
          `/storage/v1/object/public/${BUCKET_NAME}/`;

        const imageIndex =
          charity.image_url.indexOf(marker);

        if (imageIndex !== -1) {
          const imagePath =
            charity.image_url.substring(
              imageIndex + marker.length
            );

          if (imagePath) {
            const { error: storageError } =
              await supabase.storage
                .from(BUCKET_NAME)
                .remove([imagePath]);

            if (storageError) {
              console.error(
                "Charity image delete error:",
                storageError
              );
            }
          }
        }
      } catch (storageError) {
        console.error(
          "Storage cleanup error:",
          storageError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Charity deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin charity delete error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};


export {
  getAdminCharities,
  createAdminCharity,
  updateAdminCharity,
  deleteAdminCharity,
};